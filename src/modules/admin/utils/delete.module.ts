import { Module } from '@nestjs/common';
import { DeleteService } from './delete.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  providers: [DeleteService, PrismaService],
  exports: [DeleteService], // Export the DeleteService
})
export class DeleteModule {} 