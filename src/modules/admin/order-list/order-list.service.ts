import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderListService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const orders = await this.prisma.order.findMany({
        where:{
          category: {
            not: "Live Show"
          }
        },
        select: {
          id: true,
          created_at: true,
          total_amount: true,
          working_status: true,
          payment_status: true,
          user: {
            select: {
              first_name: true,
              last_name: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return {
        success: true,
        data: orders
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }


  async findItemById(id:string){
    try {
      const orderDetails = await this.prisma.order.findUnique({
        where:{
          id:id
        }
      })
      return orderDetails;
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  
}
