import { Test, TestingModule } from '@nestjs/testing';
import { OrderListController } from './order-list.controller';
import { OrderListService } from './order-list.service';

describe('OrderListController', () => {
  let controller: OrderListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderListController],
      providers: [OrderListService],
    }).compile();

    controller = module.get<OrderListController>(OrderListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
