import { Controller, Post, Body, Res, UseGuards, UseInterceptors, UsePipes, ValidationPipe, UseFilters, Get, Query } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './report.service';
import { 
  CreateTransactionReportDto, 
  CreateOrderReportDto,
  PreviewTransactionReportDto,
  PreviewOrderReportDto 
} from './dto/create-report.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { Role } from '../../../common/guard/role/role.enum';
import { ReportErrorInterceptor } from './interceptors/report-error.interceptor';
import { ReportResponseInterceptor } from './interceptors/report-response.interceptor';
import { ReportErrorFilter } from './filters/report-error.filter';
import { ReportListResponseDto } from './dto/report-list.dto';
import { ReportFilterDto } from './dto/report-filter.dto';

@UseInterceptors(ReportErrorInterceptor, ReportResponseInterceptor)
@UseFilters(ReportErrorFilter)
@ApiTags('Admin Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // Download endpoints
  @Post('transaction/generate')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Generate and download transaction report',
    description: 'Generate a transaction report for download with file URL'
  })
  @ApiBody({
    type: CreateTransactionReportDto,
    examples: {
      singleDay: {
        summary: 'Single day report',
        value: {
          date_from: '2024-03-14',
          format: 'pdf'
        }
      },
      dateRange: {
        summary: 'Date range report',
        value: {
          date_from: '2024-03-01',
          date_to: '2024-03-14',
          format: 'pdf'
        }
      }
    }
  })
  async generateTransactionReport(
    @Body() dto: CreateTransactionReportDto,
    @Res() res: Response,
  ) {
    try {
      // console.log('Download Transaction Report:', dto);
      const result = await this.reportService.generateTransactionPDF(dto);
      return res.json(result);
    } catch (error) {
      // console.error('Transaction Download Error:', error);
      throw error;
    }
  }

  @Post('orders/generate')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Generate and download order report',
    description: 'Generate an order report for download with file URL'
  })
  async generateOrderReport(
    @Body() dto: CreateOrderReportDto,
    @Res() res: Response,
  ) {
    try {
      // console.log('Download Order Report:', dto);
      const result = await this.reportService.generateOrderPDF(dto);
      return res.json(result);
    } catch (error) {
      // console.error('Order Download Error:', error);
      throw error;
    }
  }

  // Preview endpoints
  @Post('transaction/preview')
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    forbidNonWhitelisted: true
  }))
  @ApiOperation({
    summary: 'Preview transaction report',
    description: 'Generate a transaction report preview without saving'
  })
  @ApiResponse({
    status: 200,
    description: 'PDF buffer for preview',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  async previewTransactionReport(
    @Body() dto: PreviewTransactionReportDto,
    @Res() res: Response,
  ) {
    try {
      // console.log('8. Controller: Preview Transaction Input:', dto);
      // console.log('9. Controller: Calling service');
      const pdfBuffer = await this.reportService.previewTransactionPDF(dto);
      // console.log('10. Controller: Got PDF buffer, length:', pdfBuffer?.length);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      // console.log('11. Controller: Sending response');
      return res.send(pdfBuffer);
    } catch (error) {
      // console.log('12. Controller: Error caught:', error.message);
      throw error;
    }
  }

  @Post('orders/preview')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Preview order report',
    description: 'Generate an order report preview without saving'
  })
  async previewOrderReport(
    @Body() dto: PreviewOrderReportDto,
    @Res() res: Response,
  ) {
    try {
      // console.log('Preview Order Report:', dto);
      const pdfBuffer = await this.reportService.previewOrderPDF(dto);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      return res.send(pdfBuffer);
    } catch (error) {
      // console.error('Order Preview Error:', error);
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all reports',
    description: 'Get a filtered and paginated list of reports'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of reports with pagination',
    type: ReportListResponseDto
  })
  async getAllReports(@Query() filters: ReportFilterDto): Promise<ReportListResponseDto> {
    return this.reportService.getAllReports({ filters });
  }
} 