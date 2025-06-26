import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Role } from '../../../common/guard/role/role.enum';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('admin/schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
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
