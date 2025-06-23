import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try{
    return await this.prisma.order.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        comments: true,
        category: true,
        delivery_Deadline: true,
        working_status: true
      },
    });
  }
    catch(error){
      return{
        success : false,
        message: error.message
      }
    }

  }
    async updateStatus(id: string, status: 'canceled' | 'completed') {
      try {
        const updatedOrder = await this.prisma.order.update({
          where: { id },
          data: { working_status: status },
          select: {
            id: true,
            working_status: true
          }
        });
        return {
          success: true,
          data: updatedOrder
        };
      } catch (error) {
        return {
          success: false,
          message: error.message
        };
      }
    }
  }
