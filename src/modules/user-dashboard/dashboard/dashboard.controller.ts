import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    try {
      const userId = req.user.userId;
      return this.dashboardService.findAll(userId);
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Get('user/myvideos')
  @UseGuards(JwtAuthGuard)
  async findAllOrderVideo(
    @Request() req: any,
    @Query('query') query?: string,
    @Query('category') category?: string
  ) {
    try {
      const userId = req.user.userId;
      const data = await this.dashboardService.findAllOrderVideo(userId, query, category);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  @Get('user/payment-history')
  @UseGuards(JwtAuthGuard)
  async findAllPaymentHistory(@Request() req: any) {
    try {
      const userId = req.user.userId;
      const data = await this.dashboardService.findAllPaymentHistory(userId);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}
