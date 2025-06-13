import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TrafficSourcesService } from './traffic-sources.service';
import { CreateTrafficSourceDto } from './dto/create-traffic-source.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Traffic Sources')
@Controller('traffic-sources')
export class TrafficSourcesController {
  constructor(private readonly trafficSourcesService: TrafficSourcesService) {}

  @Post()
  async create(@Body() createTrafficSourceDto: CreateTrafficSourceDto) {
    try {
      const result = await this.trafficSourcesService.create(createTrafficSourceDto);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get()
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const result = await this.trafficSourcesService.findAll({ startDate, endDate });
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
