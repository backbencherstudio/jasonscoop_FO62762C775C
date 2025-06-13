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

      // filter using vendor id if the package is from vendor
      if (user_id) {
        const userDetails = await UserRepository.getUserDetails(user_id);

        if (userDetails && userDetails.type == 'vendor') {
          where_condition['vendor_id'] = user_id;
        }
      }

      const orders = await this.prisma.order.findMany({
        where: { ...where_condition, ...dateFilter },
        orderBy: {
          created_at: 'desc',
        },
        take: 7,
        select: {
          id: true,
          user_id: true,
          order_items: {
            select: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          total_amount: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      });

      // add avatar url to user
      for (const order of orders) {
        if (order.user && order.user.avatar) {
          order.user['avatar_url'] = SojebStorage.url(
            appConfig().storageUrl.avatar + order.user.avatar,
          );
        }
      }

      // getting total orders count
      const totalOrders = await this.prisma.order.count({
        where: {
          ...where_condition,
          ...dateFilter,
        },
      });

      // total vendors
      const totalVendors = await this.prisma.user.count({
        where: {
          type: 'vendor',
          ...dateFilter,
        },
      });

      // getting total users count
      const totalUsers = await this.prisma.user.count({
        where: {
          type: 'user',
          created_at: {
            gte: lastWeekStart,
          },
        },
      });

      const totalRevenue = await this.prisma.order.aggregate({
        where: {
          ...where_condition,
        },
        _sum: {
          total_amount: true,
        },
      });

      // revenue per month
      const revenuePerMonth = await this.prisma.order.groupBy({
        by: ['created_at'],
        _sum: {
          total_amount: true,
        },
        where: {
          ...where_condition,
        },
      });

      // map revenue per month
      const revenuePerMonthMap = revenuePerMonth.map((item) => {
        return {
          month: item.created_at,
          revenue: item._sum.total_amount,
        };
      });

      // sort revenue per month
      revenuePerMonthMap.sort((a, b) => {
        return new Date(a.month).getTime() - new Date(b.month).getTime();
      });

      // booking stats
      const confirmedBookings = await this.prisma.order.count({
        where: {
          ...where_condition,
          status: 'confirmed',
        },
      });

      const pendingBookings = await this.prisma.order.count({
        where: {
          ...where_condition,
          status: 'pending',
        },
      });

      const cancelledBookings = await this.prisma.order.count({
        where: {
          ...where_condition,
          status: 'cancelled',
        },
      });

      const processingBookings = await this.prisma.order.count({
        where: {
          ...where_condition,
          status: 'processing',
        },
      });

      // Get Total Sales value from last week
      // getting today date and minus 7 days then filter depend on the status
      const lastWeekSales = await this.prisma.order.aggregate({
        where: {
          ...where_condition,
          created_at: {
            gte: lastWeekStart,
          },
          status: {
            in: ['completed'], // Only count completed orders
          },
        },
        _sum: {
          total_amount: true,
        },
      });

      // Get orders by category for different time periods
      const now = new Date();

      // Calculate date ranges
      const last7DaysStart = new Date();
      last7DaysStart.setDate(last7DaysStart.getDate() - 7);

      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const lastMonthStart = new Date();
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      lastMonthStart.setDate(1);
      const lastMonthEnd = new Date();
      lastMonthEnd.setDate(0);

      const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
      const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);

      // Function to get orders by category for a specific date range
      const getOrdersByCategory = async (startDate?: Date, endDate?: Date) => {
        const dateFilter = startDate && endDate ? {
          created_at: {
            gte: startDate,
            lte: endDate,
          }
        } : {};

        const ordersByCategory = await this.prisma.productCategory.groupBy({
          by: ['category_id'],
          where: {
            product: {
              order_items: {
                some: {
                  order: {
                    ...where_condition,
                    ...dateFilter,
                  },
                },
              },
            },
          },
          _count: {
            _all: true,
          },
        });

        return ordersByCategory;
      };

      // Get category names (do this once)
      const allOrdersByCategory = await getOrdersByCategory();
      const categoryIds = allOrdersByCategory.map((item) => item.category_id);
      const categories = await this.prisma.category.findMany({
        where: {
          id: {
            in: categoryIds,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      // Function to format category data
      const formatCategoryData = (ordersByCategory) => {
        return ordersByCategory.map((item) => {
          const category = categories.find((cat) => cat.id === item.category_id);
          return {
            category_name: category?.name || 'Unknown',
            order_count: item._count._all,
          };
        });
      };

      // Get data for each time period
      const [
        last7DaysOrders,
        thisMonthOrders,
        lastMonthOrders,
        lastYearOrders,
        lifetimeOrders,
      ] = await Promise.all([
        getOrdersByCategory(last7DaysStart, now),
        getOrdersByCategory(thisMonthStart, now),
        getOrdersByCategory(lastMonthStart, lastMonthEnd),
        getOrdersByCategory(lastYearStart, lastYearEnd),
        getOrdersByCategory(), // No date range for lifetime
      ]);

      // Format the results
      const ordersByCategoryData = {
        last_7_days: formatCategoryData(last7DaysOrders),
        this_month: formatCategoryData(thisMonthOrders),
        last_month: formatCategoryData(lastMonthOrders),
        last_year: formatCategoryData(lastYearOrders),
        lifetime: formatCategoryData(lifetimeOrders),
      };

      // Count traffic sources for different time periods
      let traffic_Source_Data = {
        last_7_days: [],
        this_month: [],
        last_month: [],
        this_year: [],
        last_year: []
      };

      try {
        const now = new Date();
        
        // Add this line to define currentMonth
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Add this line to define thisYearStart
        const thisYearStart = new Date(now.getFullYear(), 0, 1);

        // Get traffic source for last 7 days
        const last7DaysSources = await this.prisma.trafficSource.findMany({
          where: {
            created_at: {
              gte: last7DaysStart,
              lte: now,
            },
          },
          select: {
            source: true,
            created_at: true,
          },
        });

        // Get traffic sources for this month
        const thisMonthSources = await this.prisma.trafficSource.findMany({
          where: {
            created_at: {
              gte: currentMonth,
              lte: now,
            },
          },
          select: {
            source: true,
            created_at: true,
          },
        });

        // Get traffic sources for last month
        const lastMonthSources = await this.prisma.trafficSource.findMany({
          where: {
            created_at: {
              gte: lastMonthStart,
              lte: lastMonthEnd,
            },
          },
          select: {
            source: true,
            created_at: true,
          },
        });

        // Get traffic sources for this year
        const thisYearSources = await this.prisma.trafficSource.findMany({
          where: {
            created_at: {
              gte: thisYearStart,
              lte: now,
            },
          },
          select: {
            source: true,
            created_at: true,
          },
        });

        // Get traffic sources for last year
        const lastYearSources = await this.prisma.trafficSource.findMany({
          where: {
            created_at: {
              gte: lastYearStart,
              lte: lastYearEnd,
            },
          },
          select: {
            source: true,
            created_at: true,
          },
        });

        

        // Process and count the sources
        const processSourceData = (sources) => {
          const sourceCounts = {};
          sources.forEach(item => {
            if (!sourceCounts[item.source]) {
              sourceCounts[item.source] = 0;
            }
            sourceCounts[item.source]++;
          });
          return Object.entries(sourceCounts).map(([source, count]) => ({
            source,
            visits: count
          }));
        };

        // Format the results
        traffic_Source_Data = {
          last_7_days: processSourceData(last7DaysSources),
          this_month: processSourceData(thisMonthSources),
          last_month: processSourceData(lastMonthSources),
          this_year: processSourceData(thisYearSources),
          last_year: processSourceData(lastYearSources)
        };

          
      } catch (error) {
        console.error('Error fetching traffic sources:', error);
        traffic_Source_Data = {
          last_7_days: [],
          this_month: [],
          last_month: [],
          this_year: [],
          last_year: []
        };
      }

      // top location for customer
        const topLocationForCustomer = await this.prisma.order.groupBy({
          by:['city'],
          _count:{
            city:true,
          },
          where:{
            city:{not: null}
          },
          orderBy:{
            _count:{
              city: 'desc'
            },
          },
          // take:1, //Get the top location
        });
        // console.log("top location", response)
      


      // Initialize result objects for customer growth
      const customerGrowthWeekly = Array.from({ length: 12 }, () => ({
        week: '',
        new_customers: 0,
        returning_customers: 0,
      }));

      const customerGrowthMonthly = Array.from({ length: 12 }, () => ({
        month: '',
        new_customers: 0,
        returning_customers: 0,
      }));

      const customerGrowthYearly = Array.from({ length: 12 }, () => ({
        year: '',
        new_customers: 0,
        returning_customers: 0,
      }));

      // Get current date and calculate date ranges
      const currentDate = new Date();
      const last12WeeksStart = new Date(currentDate);
      last12WeeksStart.setDate(currentDate.getDate() - 84); // 12 weeks = 84 days

      const last12MonthsStart = new Date(currentDate);
      last12MonthsStart.setMonth(currentDate.getMonth() - 12); // 12 months

      const last12YearsStart = new Date(currentDate);
      last12YearsStart.setFullYear(currentDate.getFullYear() - 12); // 12 years

      // Fetch all orders for the last 12 years
      const ordersOfYear = await this.prisma.order.findMany({
        where: {
          created_at: {
            gte: last12YearsStart,
          },
          ...where_condition,
        },
        select: {
          user_id: true,
          created_at: true,
        },
      });

      // Count orders per customer
      const customerOrderCount: { [key: string]: CustomerOrderCount } = {};
      for (const order of ordersOfYear) {
        const orderDate = new Date(order.created_at);
        const weekIndex = Math.floor((currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24 * 7)); // Calculate week index
        const monthIndex = orderDate.getMonth(); // Get month index (0-11)
        const yearIndex = orderDate.getFullYear(); // Get year

        const key = order.user_id; // Unique key for user
        if (!customerOrderCount[key]) {
          customerOrderCount[key] = { count: 0, weeks: new Set(), months: new Set(), years: new Set() };
        }
        customerOrderCount[key].count++;
        customerOrderCount[key].weeks.add(weekIndex); // Add week index to the set
        customerOrderCount[key].months.add(monthIndex); // Add month index to the set
        customerOrderCount[key].years.add(yearIndex); // Add year to the set
      }

      // Helper function to classify customers
      const classifyCustomers = (growthArray: any[], timeUnit: string, countData: { [key: string]: CustomerOrderCount }, isWeekly: boolean) => {
        for (let i = 0; i < growthArray.length; i++) {
          if (isWeekly) {
            const weekStartDate = new Date(currentDate);
            weekStartDate.setDate(currentDate.getDate() - (i * 7)); // Calculate the start date of the week
            growthArray[i].week = `${weekStartDate.toLocaleString('default', { month: 'long' })} week ${Math.floor(weekStartDate.getDate() / 7) + 1}`;
          } else {
            growthArray[i].month = new Date(currentDate.getFullYear(), i).toLocaleString('default', { month: 'long' });
          }

          for (const [key, value] of Object.entries(countData)) {
            const isReturning = value.count > 1;

            if (isWeekly ? value.weeks.has(i) : value.months.has(i)) {
              if (isReturning) {
                isWeekly ? growthArray[i].returning_customers++ : growthArray[i].returning_customers++;
              } else {
                isWeekly ? growthArray[i].new_customers++ : growthArray[i].new_customers++;
              }
            }
          }
        }
      };

      // Classify customers for weekly, monthly, and yearly growth
      classifyCustomers(customerGrowthWeekly, 'week', customerOrderCount, true);
      classifyCustomers(customerGrowthMonthly, 'month', customerOrderCount, false);

      // Determine new and returning customers for each of the last 12 years
      for (let year = 0; year < 12; year++) {
        const yearLabel = currentDate.getFullYear() - year;
        customerGrowthYearly[year].year = yearLabel.toString();

        for (const [key, value] of Object.entries(customerOrderCount)) {
          const isReturning = value.count > 1;

          if (value.years.has(yearLabel)) {
            if (isReturning) {
              customerGrowthYearly[year].returning_customers++;
            } else {
              customerGrowthYearly[year].new_customers++;
            }
          }
        }
      }




      return {
        success: true,
        data: {
          // dashboard status with date filter
          total_revenue: totalRevenue._sum.total_amount || 0,
          total_orders: totalOrders,
          total_vendors: totalVendors,
          total_users: totalUsers,
          date_range: {
            start: startDate || 'last week',
            end: endDate || 'current',
          },
          
          orders: orders,
          
          // Updated orders by category section
          orders_by_category: ordersByCategoryData,

          last_week_sales: lastWeekSales._sum.total_amount || 0,
          revenue_per_month: revenuePerMonthMap,
          confirmed_bookings: confirmedBookings,
          pending_bookings: pendingBookings,
          cancelled_bookings: cancelledBookings,
          processing_bookings: processingBookings,

          // traffic sources
          traffic_sources: traffic_Source_Data,
          
          // top location for customer
          top_location_for_customer: topLocationForCustomer,

          // customer growth + returning customers(customer & customer growth section)
          customer_growth_weekly: customerGrowthWeekly,
          customer_growth_monthly: customerGrowthMonthly,
          customer_growth_yearly: customerGrowthYearly,


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
}
