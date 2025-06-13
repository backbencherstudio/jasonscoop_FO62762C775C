import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ReportResponseInterceptor } from './interceptors/report-response.interceptor';
import { ReportErrorFilter } from './filters/report-error.filter';

@Module({
  controllers: [ReportController],
  providers: [
    ReportService,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ReportResponseInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: ReportErrorFilter
    }
  ],
  exports: [ReportService],
})
export class ReportModule {} 