import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';

@Controller('admin/analytics')
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
