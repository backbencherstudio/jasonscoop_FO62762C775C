import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ReportGenerationException } from '../exceptions/report.exception';
import { ReportListException } from '../exceptions/report-list.exception';

@Catch(ReportGenerationException, ReportListException, HttpException)
export class ReportErrorFilter implements ExceptionFilter {
  catch(exception: ReportGenerationException | ReportListException | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = 
      exception instanceof ReportGenerationException || exception instanceof ReportListException
        ? exception.message
        : (exception instanceof HttpException 
          ? exception.message 
          : 'Internal server error');

    response.status(status).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(request.url === '/api/admin/reports' && {
        pagination: {
          current_page: 1,
          total_pages: 0,
          total_items: 0
        },
        data: []
      })
    });
  }
} 