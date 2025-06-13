import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { DeleteService } from '../utils/delete.service';

type PaymentTransaction = Prisma.PaymentTransactionGetPayload<{
  include: { user: { select: { id: true; name: true } } };
}>;

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService, private readonly deleteService: DeleteService) {}

  async findAll({
    filters: {
      type,
      cursor,
      limit = 10,
      page = 1,
      q,
      sortBy = 'default',
      order = 'desc',
      startDate,
      endDate,
    },
  }) {
    try {
      let userTypes = ['vendor'];
      if (type === 'logistics') {
        userTypes = ['logistic_manager', 'logistic_agent'];
      }

      const where_condition: any = {
        type: 'withdraw',
        status: 'succeeded',
        user: {
          type: {
            in: userTypes,
          },
        },
      };

      // Add date range filter if dates are provided
      if (startDate || endDate) {
        where_condition.created_at = {};

        if (startDate) {
          where_condition.created_at.gte = new Date(
            startDate + 'T00:00:00.000Z',
          );
        }

        if (endDate) {
          where_condition.created_at.lte = new Date(endDate + 'T23:59:59.999Z');
        }
      }

      // Add search condition if q exists
      if (q) {
        const trimContent = q.trim();
        where_condition.OR = [
          { reference_number: { contains: trimContent, mode: 'insensitive' } },
          { user: { name: { contains: trimContent, mode: 'insensitive' } } },
        ];
      }

      // Handle sorting
      let orderBy: any = { created_at: 'desc' }; // Default sorting by date

      if (sortBy && sortBy !== 'default') {
        switch (sortBy) {
          case 'amount':
            orderBy = { amount: order };
            break;
          case 'status':
            orderBy = { status: order };
            break;
          case 'payment_to':
            orderBy = { withdraw_via: order };
            break;
        }
      }

      const query_condition: any = {};

      // cursor based pagination
      if (cursor) {
        query_condition.cursor = {
          id: cursor,
        };
        query_condition.skip = 1;
      }

      // offset based pagination
      if (page) {
        query_condition.skip = (Number(page) - 1) * Number(limit);
      }

      if (limit) {
        query_condition.take = Number(limit);
      }

      

      const total_items_count = await this.prisma.paymentTransaction.count({
        where: where_condition,
      });

      const transactions = await this.prisma.paymentTransaction.findMany({
        where: where_condition,
        orderBy,
        ...query_condition,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const formattedTransactions = transactions.map(
        (tx: PaymentTransaction) => ({
          id: tx.id,
          company_name: tx.user?.name || 'N/A',
          transaction_id: tx.reference_number,
          withdraw_date: tx.created_at,
          amount: `${tx.amount}`,
          status: tx.status === 'succeeded' ? 'paid' : tx.status,
          payment_to: tx.withdraw_via,
          actions: `View ${tx.id}`,
        }),
      );

      const pagination = {
        current_page: Number(page),
        total_pages: Math.ceil(total_items_count / Number(limit)),
        total_items: total_items_count,
        cursor: cursor,
      };

      return {
        success: true,
        pagination: pagination,
        data: formattedTransactions,
      };
    } catch (error) {
      // console.error('Payroll Error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async getTransaction(transactionId: string) {
    try {
      const transaction = await this.prisma.paymentTransaction.findUnique({
        where: { id: transactionId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return {
        success: true,
        data: {
          company_name: transaction.user?.name || 'N/A',
          transaction_id: transaction.reference_number,
          withdraw_date: transaction.created_at,
          amount: `${transaction.amount}`,
          status: transaction.status === 'succeeded' ? 'paid' : transaction.status,
          payment_to: transaction.withdraw_via,
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