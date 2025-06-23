import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const transactions = await this.prisma.paymentTransaction.findMany({
        select: {
          id: true,
          created_at: true,
          amount: true,
          status: true,
          order: {
            select: {
              invoice_number: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return {
        success: true,
        data: transactions.map(transaction => ({
          id: transaction.id,
          date: transaction.created_at,
          amount: transaction.amount,
          status: transaction.status,
          invoice_number: transaction.order?.invoice_number
        }))
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}
