import { Module } from '@nestjs/common';
import { LogisticsVerificationController } from './logistics-verification.controller';
import { LogisticsVerificationService } from './logistics-verification.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [LogisticsVerificationController],
  providers: [LogisticsVerificationService, PrismaService],
})
export class LogisticsVerificationModule {}
