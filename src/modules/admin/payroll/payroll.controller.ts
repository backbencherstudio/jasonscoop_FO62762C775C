import {
  Controller,
  Get,
  Query,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GetQueryDto } from './dto/query-payroll.dto';


@ApiTags('Admin/Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @ApiOperation({ summary: 'Get payroll list' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['default', 'amount', 'status', 'payment_to'],
  })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Format: YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Format: YYYY-MM-DD',
  })
  @Get()
  async findAll(
    @Query()
    query: GetQueryDto
  ) {
    try {
      const payrolls = await this.payrollService.findAll({
        filters: {
          type: query.type,
          cursor: query.cursor,
          page: query.page,
          limit: query.limit,
          q: query.q,
          sortBy: query.sortBy,
          order: query.order,
          startDate: query.startDate,
          endDate: query.endDate,
        },
      });
      return payrolls;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string) {
    try {
      return await this.payrollService.getTransaction(id);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}