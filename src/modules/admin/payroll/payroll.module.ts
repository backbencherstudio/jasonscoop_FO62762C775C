import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { DeleteModule } from '../utils/delete.module';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  imports: [DeleteModule],
  controllers: [PayrollController],
  providers: [PayrollService, PrismaService],
})
export class PayrollModule {}
