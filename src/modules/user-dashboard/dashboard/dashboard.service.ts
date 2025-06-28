import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    try {
      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true
        }
      });

      // Get order count for the user
      const orderCount = await this.prisma.order.count({
        where: {
          user_id: userId,
          payment_status: "succeeded"
        }
      });

      // Get total spending from payment transactions
      const totalSpending = await this.prisma.paymentTransaction.aggregate({
        _sum: {
          amount: true
        },
        where: {
          user_id: userId,
          status: 'completed'
        }
      });

      // Get payment history list
      const paymentHistory = await this.prisma.paymentTransaction.findMany({
        where: {
          user_id: userId
        },
        select: {
          id: true,
          created_at: true,
          amount: true,
          status: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      // Get video details from user orders
      // const videoOrders = await this.prisma.order.findMany({
      //   where: {
      //     user_id: userId
      //   },
      //   select: {
      //     id: true,
      //     created_at: true,
      //     status: true,
      //     total_amount: true,
      //     video: {
      //       select: {
      //         title: true,
      //         thumbnail: true,
      //         category: true
      //       }
      //     }
      //   },
      //   orderBy: {
      //     created_at: 'desc'
      //   }
      // });

      return {
        success: true,
        data: {
          user,
          orderCount,
          totalSpending: totalSpending._sum.amount || 0,
          paymentHistory,
          // videoOrders: videoOrders.map(order => ({
          //   id: order.id,
          //   title: order.video?.title,
          //   image: order.video?.thumbnail,
          //   category: order.video?.category,
          //   status: order.status,
          //   date: order.created_at,
          //   price: order.total_amount
          // }))
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }


  async findAllOrderVideo(userId: string, query?: string, category?: string) {
    try {
      const allvideoData = await this.prisma.video.findMany({
        where: {
          userId,
          orderId: { not: null },
          ...(query && {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          }),
          ...(category && { category: { equals: category, mode: 'insensitive' } })
        },
        include: {
          order: {
            select: {
              working_status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return allvideoData.map(category => ({
        ...category,
        videoUrl: category.video ? `${process.env.BACKEND_APP_URL}/storage/video/${category.video}` : null,
        thumbnailUrl: category.thumbnail ? `${process.env.BACKEND_APP_URL}/storage/thumbnail/${category.thumbnail}` : null
      }));
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  async findAllPaymentHistory(userId: string) {
    try {
      const paymentHistory = await this.prisma.paymentTransaction.findMany({
        where: {
          user_id: userId
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      return paymentHistory;
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}
