import { Injectable } from '@nestjs/common';
import { CreateTrafficSourceDto } from './dto/create-traffic-source.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TrafficSourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTrafficSourceDto: CreateTrafficSourceDto) {
    try {
      const { source, referrer } = createTrafficSourceDto;

      // Create new traffic source entry
      const trafficSource = await this.prisma.trafficSource.create({
        data: {
          source,
          referrer,
        },
      });

      return {
        success: true,
        data: trafficSource,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findAll({ startDate, endDate }: { startDate?: string; endDate?: string }) {
    try {
      // Build where condition for date filtering
      const where: any = {};
      
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) {
          where.created_at.gte = new Date(startDate);
        }
        if (endDate) {
          where.created_at.lte = new Date(endDate);
        }
      }

      // Get traffic sources with count
      const trafficSources = await this.prisma.trafficSource.groupBy({
        by: ['source'],
        where,
        _count: {
          source: true,
        },
      });

      // Format the response
      const formattedData = trafficSources.map((item) => ({
        source: item.source,
        visits: item._count.source,
      }));

      return {
        success: true,
        data: formattedData,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
