import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Role } from '../../../common/guard/role/role.enum';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiBearerAuth()
@ApiTags('Dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.VENDOR)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get dashboard data' })
  @Get()
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Format: YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Format: YYYY-MM-DD' })
  async findAll(
    @Query('user_id') user_id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      return this.dashboardService.findAll(user_id, startDate, endDate);
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  @ApiOperation({ summary: 'Get income analytics data' })
  @Get('/analytics-income')
  @ApiQuery({ 
    name: 'period', 
    required: true, 
    enum: ['1 month', '6 months', '1 year'],
    description: 'Time period for analytics (1 month, 6 months, or 1 year)' 
  })
  async findOverrallIncome(
    @Query('period') period: string,
  ) {
    try {
      return this.dashboardService.findOverrallIncome(period);
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}
