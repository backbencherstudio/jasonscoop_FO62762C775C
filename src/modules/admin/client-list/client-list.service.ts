import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientListService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const clients = await this.prisma.user.findMany({
        where: {
          type: 'user' // Filter for client users
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true,
          created_at: true,
          status: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return {
        success: true,
        data: clients
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}
