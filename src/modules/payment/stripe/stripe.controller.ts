import { Controller, Post, Res, Req, Headers, Body, UseGuards, RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';
import { TransactionRepository } from '../../../common/repository/transaction/transaction.repository';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('payment/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('plan-payment')
  @UseGuards(JwtAuthGuard)
  async createPlanPayment(
    @Body()
    paymentData: {
      amount: number;
      firstName: string;
      lastName: string;
      email: string;
      occasion: string;
      description: string;
      recipientName?: string;
      deliveryDeadline: string;
      phoneNumber: string;
      country: string;
      paymentMethodId: string;
      category : string
    },
    @Req() req: Request,
  ) {
    // Get user ID from JWT token
    const userId = req.user.userId;

    try{
      return this.stripeService.createPlanPayment({
        ...paymentData,
        userId,
      });
    }catch(error){
      return error.message
    }

  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response
  ) {
    try {
      if (!signature) {
        res.status(400).json({ received: false, error: 'No signature found' });
        return;
      }

      if (!req.rawBody) {
        res.status(400).json({ received: false, error: 'No raw body found' });
        return;
      }

      const event = await this.stripeService.handleWebhook(req.rawBody, signature);

      // Handle events
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          // Find order by payment reference number
          const order = await prisma.order.findFirst({
            where: { payment_reference_number: paymentIntent.id }
          });
          
          if (order) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                status: 'completed',
                payment_status: 'paid',
                payment_raw_status: paymentIntent.status,
                paid_amount: paymentIntent.amount / 100,
                paid_currency: paymentIntent.currency,
              }
            });
          }

          await TransactionRepository.updateTransaction({
            reference_number: paymentIntent.id,
            status: 'completed',
            paid_amount: paymentIntent.amount / 100,
            paid_currency: paymentIntent.currency,
            raw_status: paymentIntent.status,
          });
          break;
        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object;
          await TransactionRepository.updateTransaction({
            reference_number: failedPaymentIntent.id,
            status: 'failed',
            raw_status: failedPaymentIntent.status,
          });
          break;
        case 'payment_intent.canceled':
          const canceledPaymentIntent = event.data.object;
          await TransactionRepository.updateTransaction({
            reference_number: canceledPaymentIntent.id,
            status: 'canceled',
            raw_status: canceledPaymentIntent.status,
          });
          break;
        case 'payment_intent.requires_action':
          const requireActionPaymentIntent = event.data.object;
          await TransactionRepository.updateTransaction({
            reference_number: requireActionPaymentIntent.id,
            status: 'requires_action',
            raw_status: requireActionPaymentIntent.status,
          });
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook Error:', error);
      res.status(400).json({ received: false, error: error.message });
    }
  }
}
