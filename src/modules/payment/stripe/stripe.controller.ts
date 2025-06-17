import { Controller, Post, Res, Req, Headers, Body, UseGuards, RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';
import { TransactionRepository } from '../../../common/repository/transaction/transaction.repository';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

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

      // Convert raw body to string if it's a Buffer
      const rawBody = Buffer.isBuffer(req.rawBody) ? req.rawBody.toString('utf8') : req.rawBody;

      const event = await this.stripeService.handleWebhook(rawBody, signature);

      // Handle events
      switch (event.type) {
        // case 'customer.created':
        //   console.log('Customer Created:', event.data.object);
        //   break;
        // case 'payment_intent.created':
        //   console.log('Payment Intent Created:', event.data.object);
        //   break;
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          // console.log('=== Payment Intent Succeeded ===');
          // console.log('Payment Intent ID:', paymentIntent.id);
          // console.log('Amount:', paymentIntent.amount);
          // console.log('Currency:', paymentIntent.currency);
          // console.log('Status:', paymentIntent.status);
          // Update transaction status in database
          await TransactionRepository.updateTransaction({
            reference_number: paymentIntent.id,
            status: 'succeeded',
            paid_amount: paymentIntent.amount / 100,
            paid_currency: paymentIntent.currency,
            raw_status: paymentIntent.status,
          });
          // console.log('Transaction updated in database');
          break;
        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object;
          // console.log('Payment Intent Failed:', failedPaymentIntent);
          await TransactionRepository.updateTransaction({
            reference_number: failedPaymentIntent.id,
            status: 'failed',
            raw_status: failedPaymentIntent.status,
          });
          break;
        case 'payment_intent.canceled':
          const canceledPaymentIntent = event.data.object;
          // console.log('Payment Intent Canceled:', canceledPaymentIntent);
          await TransactionRepository.updateTransaction({
            reference_number: canceledPaymentIntent.id,
            status: 'canceled',
            raw_status: canceledPaymentIntent.status,
          });
          break;
        case 'payment_intent.requires_action':
          const requireActionPaymentIntent = event.data.object;
          // console.log('Payment Intent Requires Action:', requireActionPaymentIntent);
          await TransactionRepository.updateTransaction({
            reference_number: requireActionPaymentIntent.id,
            status: 'requires_action',
            raw_status: requireActionPaymentIntent.status,
          });
          break;
        case 'payout.paid':
          const paidPayout = event.data.object;
          // console.log('Payout Paid:', paidPayout);
          break;
        case 'payout.failed':
          const failedPayout = event.data.object;
          // console.log('Payout Failed:', failedPayout);
          break;
        default:
          // console.log(`Unhandled event type ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      // console.error('=== Webhook Error ===');
      // console.error('Error:', error);
      // console.error('Error details:', {
      //   message: error.message,
      //   type: error.type,
      //   code: error.code,
      //   requestId: error.requestId,
      // });
      res.status(400).json({ received: false, error: error.message });
    }
  }
}
