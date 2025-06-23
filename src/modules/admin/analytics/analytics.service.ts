import { Injectable } from '@nestjs/common';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { PrismaService } from 'src/prisma/prisma.service';

// Define interface for category analytics
export interface CategoryAnalyticsItem {
    category: string;
    count: number;
    percentage: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAnalyticsDto: CreateAnalyticsDto) {
    return 'This action adds a new analytics';
  }

  async findAll(period:string) {
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

      // Define interface for user analytics data
      interface UserAnalyticsItem {
          period: Date;
          user_count: number;
      }

      // Get user signups grouped by period
      const userData = await this.prisma.$queryRaw<UserAnalyticsItem[]>`
          SELECT 
              DATE_TRUNC(${groupByField === 'created_at_day' ? 'day' : 'month'}, created_at) as period,
              COUNT(*)::integer as user_count
          FROM users
          WHERE created_at BETWEEN ${startDate} AND ${now}
          GROUP BY period
          ORDER BY period ASC
      `;

      return {
          success: true,
          data: userData.map((item) => ({
              period: groupByField === 'created_at_day' ? 
                  item.period.toISOString().split('T')[0] :
                  `${item.period.getFullYear()}-${(item.period.getMonth() + 1).toString().padStart(2, '0')}`,
              user_count: item.user_count
          }))
      };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
  }

  
  async bookingCategoryAnalytics(period:string) {
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

      

      // Get total orders count for the period
      const totalOrders = await this.prisma.order.count({
        where: {
          created_at: {
            gte: startDate,
            lte: now
          }
        }
      });

      // Get category distribution
      const categoryData = await this.prisma.$queryRaw<CategoryAnalyticsItem[]>`
        WITH category_counts AS (
          SELECT 
            category,
            COUNT(*)::integer as count
          FROM orders
          WHERE created_at BETWEEN ${startDate} AND ${now}
          GROUP BY category
        )
        SELECT 
          category,
          count,
          ROUND((count::float / ${totalOrders}::float * 100)::numeric, 2) as percentage
        FROM category_counts
        ORDER BY count DESC
      `;

      return {
          success: true,
          data: {
              total_orders: totalOrders,
              categories: categoryData
          }
      };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
  }

}
