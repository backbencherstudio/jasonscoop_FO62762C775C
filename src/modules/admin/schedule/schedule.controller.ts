import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ScheduleService } from './schedule.service';

@Controller('admin/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async findAll() {
    try {
      return this.scheduleService.findAll();
    } catch (error) {
      return{
        success : false,
        message: error.message
      }
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'canceled' | 'completed' }
  ) {
    try {
      return this.scheduleService.updateStatus(id, body.status);
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}
