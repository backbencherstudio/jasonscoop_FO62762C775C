import { Injectable } from '@nestjs/common';
import { StripePayment } from '../../../common/lib/Payment/stripe/StripePayment';
import { TransactionRepository } from '../../../common/repository/transaction/transaction.repository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class StripeService {
  async handleWebhook(rawBody: string, sig: string | string[]) {
    return StripePayment.handleWebhook(rawBody, sig);
  }
  async createPlanPayment({
    amount,
    firstName,
    lastName,
    email,
    occasion,
    description,
    recipientName,
    deliveryDeadline,
    phoneNumber,
    country,
    paymentMethodId,
    category,
    userId,
  }: {
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
    category,
    userId: string;
  }) {
    try {
      
      // Create or get customer
      const customer = await StripePayment.createCustomer({
        user_id: email,
        name: `${firstName} ${lastName}`,
        email: email,
      });

      // Create payment intent with metadata
      const paymentIntent = await StripePayment.createPaymentIntent({
        amount,
        currency: 'usd',
        customer_id: customer.id,
        metadata: {
          occasion,
          description,
          recipient_name: recipientName || '',
          delivery_deadline: deliveryDeadline,
          phone_number: phoneNumber,
          country,
          user_id: userId,
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        }
      });

      // Create order record first
      const order = await prisma.order.create({
        data: {
          user_id: userId,
          status: 'pending',
          total_amount: amount,
          payment_status: 'pending',
          payment_provider: 'stripe',
          payment_reference_number: paymentIntent.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone_number: phoneNumber,
          country: country,
          occasion: occasion,
          Recipient: recipientName || 'N/A',
          delivery_Deadline: deliveryDeadline,
          comments: description,
          category: category
        },
      });


      // Create transaction record with order ID
      await TransactionRepository.createTransaction({
        order_id: order.id,
        amount: amount,
        currency: 'usd',
        status: 'pending',
        reference_number: paymentIntent.id,
        type: 'order',
        provider: 'stripe',
        user_id: userId
      });

      // Confirm payment with payment method
      const confirmedPayment = await StripePayment.confirmPayment({
        paymentIntentId: paymentIntent.id,
        paymentMethodId: paymentMethodId,
      });

      // Update order and transaction status if payment succeeded
      if (confirmedPayment.status === 'succeeded') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'completed',
            payment_status: 'paid',
            payment_raw_status: confirmedPayment.status,
            paid_amount: confirmedPayment.amount / 100,
            paid_currency: confirmedPayment.currency,
          }
        });

        await TransactionRepository.updateTransaction({
          reference_number: paymentIntent.id,
          status: 'succeeded',
          paid_amount: confirmedPayment.amount / 100,
          paid_currency: confirmedPayment.currency,
          raw_status: confirmedPayment.status,
        });
      }

      return {
        success: true,
        data: {
          payment_intent_id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          status: confirmedPayment.status,
          order_id: order.id,
        },
      };
    } catch (error) {
      // console.error('Error creating plan payment:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async createSubscription({
    priceId,
    firstName,
    lastName,
    email,
    occasion,
    description,
    recipientName,
    deliveryDeadline,
    phoneNumber,
    country,
    paymentMethodId,
  }: {
    priceId: string;
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
  }) {
    try {
      // Create or get customer
      const customer = await StripePayment.createCustomer({
        user_id: email,
        name: `${firstName} ${lastName}`,
        email: email,
      });

      // Attach payment method to customer
      await StripePayment.attachCustomerPaymentMethodId({
        customer_id: customer.id,
        payment_method_id: paymentMethodId,
      });

      // Set as default payment method
      await StripePayment.setCustomerDefaultPaymentMethodId({
        customer_id: customer.id,
        payment_method_id: paymentMethodId,
      });

      // Create subscription
      const subscription = await StripePayment.createSubscription({
        customerId: customer.id,
        priceId: priceId,
        metadata: {
          occasion,
          description,
          recipient_name: recipientName || '',
          delivery_deadline: deliveryDeadline,
          phone_number: phoneNumber,
          country,
        },
      });

      // Create transaction record
      await TransactionRepository.createTransaction({
        order_id: subscription.id,
        amount: subscription.items.data[0].price.unit_amount / 100,
        currency: subscription.currency,
        reference_number: subscription.id,
        status: subscription.status,
        type: 'subscription',
        provider: 'stripe'
      });

      return {
        success: true,
        data: {
          subscription_id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await StripePayment.cancelSubscription(subscriptionId);
      return {
        success: true,
        data: {
          subscription_id: subscription.id,
          status: subscription.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async updateSubscription({
    subscriptionId,
    priceId,
  }: {
    subscriptionId: string;
    priceId: string;
  }) {
    try {
      const subscription = await StripePayment.updateSubscription({
        subscriptionId,
        priceId,
      });
      return {
        success: true,
        data: {
          subscription_id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}


