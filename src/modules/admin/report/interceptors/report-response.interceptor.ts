import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class ReportResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map(data => {
        if (request.method === 'GET' && request.url === '/api/admin/reports') {
          return {
            success: true,
            data: data.data || [],
            message: data.message || 'Reports retrieved successfully'
          };
        }
        return data;
      }),
    );
  }
} 