import { Module } from '@nestjs/common';
import { ManagementController } from './employee-management.controller';
import { ManagementService } from './employee-management.service';
import { DeleteModule } from '../utils/delete.module';

@Module({
  imports: [DeleteModule],
  controllers: [ManagementController],
  providers: [ManagementService],
})
export class ManagementModule {}
