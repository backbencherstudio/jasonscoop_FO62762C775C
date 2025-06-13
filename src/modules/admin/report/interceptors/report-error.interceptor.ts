import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReportGenerationException } from '../exceptions/report.exception';

@Injectable()
export class ReportErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        if (error instanceof ReportGenerationException) {
          return throwError(() => new HttpException({
            success: false,
            message: error.message,
          }, HttpStatus.BAD_REQUEST));
        }
        return throwError(() => new HttpException({
          success: false,
          message: 'Internal server error',
        }, HttpStatus.INTERNAL_SERVER_ERROR));
      }),
    );
  }
} 