import { Controller, Get, UseGuards, Request } from '@nestjs/common';
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
}
