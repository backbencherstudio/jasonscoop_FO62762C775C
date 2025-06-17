import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TransactionRepository {
  /**
   * Create transaction
   * @returns
   */
  static async createTransaction({
    order_id,
    amount,
    currency,
    reference_number,
    status = 'pending',
    type = 'order',
    provider = 'stripe',
    user_id,
    store_id,
  }: {
    order_id: string;
    amount?: number;
    currency?: string;
    reference_number?: string;
    status?: string;
    type?: string;
    provider?: string;
    user_id?: string;
    store_id?: string;
  }) {
    const data = {};
    if (order_id) {
      data['order_id'] = order_id;
    }
    if (amount) {
      data['amount'] = Number(amount);
    }
    if (currency) {
      data['currency'] = currency;
    }
    if (reference_number) {
      data['reference_number'] = reference_number;
    }
    if (status) {
      data['status'] = status;
    }
    if (type) {
      data['type'] = type;
    }
    if (provider) {
      data['provider'] = provider;
    }
    if (user_id) {
      data['user_id'] = user_id;
    }
    if (store_id) {
      data['store_id'] = store_id;
    }
    return await prisma.paymentTransaction.create({
      data: {
        ...data,
      },
    });
  }

  /**
   * Update transaction
   * @returns
   */
  static async updateTransaction({
    reference_number,
    status = 'pending',
    paid_amount,
    paid_currency,
    raw_status,
  }: {
    reference_number: string;
    status: string;
    paid_amount?: number;
    paid_currency?: string;
    raw_status?: string;
  }) {
    const data = {};
    const order_data = {};
    if (status) {
      data['status'] = status;
      order_data['payment_status'] = status;
    }
    if (paid_amount) {
      data['paid_amount'] = Number(paid_amount);
      order_data['paid_amount'] = Number(paid_amount);
    }
    if (paid_currency) {
      data['paid_currency'] = paid_currency;
      order_data['paid_currency'] = paid_currency;
    }
    if (raw_status) {
      data['raw_status'] = raw_status;
      order_data['payment_raw_status'] = raw_status;
    }

    const paymentTransaction = await prisma.paymentTransaction.findMany({
      where: {
        reference_number: reference_number,
      },
    });

    // update booking status
    if (paymentTransaction.length > 0) {
      await prisma.order.update({
        where: {
          id: paymentTransaction[0].order_id,
        },
        data: {
          ...order_data,
        },
      });
    }

    return await prisma.paymentTransaction.updateMany({
      where: {
        reference_number: reference_number,
      },
      data: {
        ...data,
      },
    });
  }
}
