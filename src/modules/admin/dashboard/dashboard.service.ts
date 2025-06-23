import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SojebStorage } from '../../../common/lib/Disk/SojebStorage';
import appConfig from '../../../config/app.config';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRepository } from 'src/common/repository/user/user.repository';

interface CustomerOrderCount {
  count: number;
  weeks: Set<number>;
  months: Set<number>;
  years: Set<number>;
}

@Injectable()
export class DashboardService extends PrismaClient {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(user_id: string, startDate?: string, endDate?: string) {
    try {
      const where_condition = {};
      let dateFilter: { created_at?: { gte?: Date; lte?: Date } } = {};
      
      // Define lastWeekStart here
      const lastWeekStart = new Date();
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);

      // Set up date filter if dates are provided
      if (startDate || endDate) {
        dateFilter.created_at = {};
        
        if (startDate) {
          dateFilter.created_at.gte = new Date(startDate + 'T00:00:00.000Z');
        }
        
        if (endDate) {
          dateFilter.created_at.lte = new Date(endDate + 'T23:59:59.999Z');
        }
      } else {
        // Default to last week if no dates provided
        dateFilter = {
          created_at: {
            gte: lastWeekStart,
          }
        };
      }

      // total orders 
      const orders = await this.prisma.order.count();

      // total count of the video
      const totalVideo = await this.prisma.video.count()

      // getting total users count
      const totalUsers = await this.prisma.user.count({
        where: {
          type: 'user',
          created_at: {
            gte: lastWeekStart,
          },
        },
      });

      // total revenue
      const totalRevenue = await this.prisma.order.aggregate({
        where: {
          ...where_condition,
        },
        _sum: {
          total_amount: true,
        },
      });

      const latestTransaction = await this.prisma.order.findMany({
        take: 4,
        orderBy: {
          created_at: 'desc',
        },
      });
      
      const sendClientList = await this.prisma.order.findMany({
        take: 5,
        orderBy: {
          created_at: 'desc',
        },
      });

      return {
        success: true,
        data: {
          // dashboard status with date filter
          total_revenue: totalRevenue._sum.total_amount || 0,
          totalVideo,
          total_users: totalUsers,
          totalOrders: orders,
          latestTransaction: latestTransaction,
          sendClientList: sendClientList
        },
      };
    } catch (error) {
      // console.error('Error in findAll method:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findOverrallIncome(period: string) {
      try {
          const now = new Date();
          let startDate: Date;
          let groupByField: string;
          
          switch (period) {
              case '1 month':
                  startDate = new Date();
                  startDate.setMonth(now.getMonth() - 1);
                  groupByField = 'created_at_day';
                  break;
              case '6 months':
                  startDate = new Date();
                  startDate.setMonth(now.getMonth() - 6);
                  groupByField = 'created_at_month';
                  break;
              case '1 year':
                  startDate = new Date();
                  startDate.setFullYear(now.getFullYear() - 1);
                  groupByField = 'created_at_month';
                  break;
              default:
                  throw new Error('Invalid period specified. Use "1 month", "6 months", or "1 year"');
          }
  
          // Define an interface for the raw query result
          interface IncomeDataItem {
              period: Date;
              income: string | number;
          }
  
          // Use raw SQL query to avoid type issues
          const incomeData = await this.prisma.$queryRaw<IncomeDataItem[]>`
              SELECT 
                  DATE_TRUNC(${groupByField === 'created_at_day' ? 'day' : 'month'}, created_at) as period,
                  SUM(total_amount)::float as income
              FROM orders
              WHERE created_at BETWEEN ${startDate} AND ${now}
              GROUP BY period
              ORDER BY period ASC
          `;
  
          return {
              success: true,
              data: incomeData.map((item) => ({
                  period: groupByField === 'created_at_day' ? 
                      item.period.toISOString().split('T')[0] :
                      `${item.period.getFullYear()}-${(item.period.getMonth() + 1).toString().padStart(2, '0')}`,
                  income: Number(item.income) || 0
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
