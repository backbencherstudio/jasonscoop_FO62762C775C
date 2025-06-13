import { Module } from '@nestjs/common';
import { ReturnProductService } from './return-product.service';
import { ReturnProductController } from './return-product.controller';

@Module({
  controllers: [ReturnProductController],
  providers: [ReturnProductService],
})
export class ReturnProductModule {}
