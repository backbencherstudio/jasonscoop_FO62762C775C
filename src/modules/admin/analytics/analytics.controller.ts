import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { Role } from '../../../common/guard/role/role.enum';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
    async userAnalytics(
      @Query('period') period:string
    ) {
    try {
      return this.analyticsService.findAll(period);
    } catch (error) {
      return{
        success : false,
        message: error.message
      }
    }
  }

  @Get("booking-category")
    async bookingCategoryAnalytics(
      @Query('period') period:string
    ) {
    try {
      return this.analyticsService.bookingCategoryAnalytics(period);
    } catch (error) {
      return{
        success : false,
        message: error.message
      }
    }
  }

}
