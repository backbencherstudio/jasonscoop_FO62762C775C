import { Module } from '@nestjs/common';
import { OrderListService } from './order-list.service';
import { OrderListController } from './order-list.controller';

@Module({
  controllers: [OrderListController],
  providers: [OrderListService],
})
export class OrderListModule {}
