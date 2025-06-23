import { Test, TestingModule } from '@nestjs/testing';
import { OrderListService } from './order-list.service';

describe('OrderListService', () => {
  let service: OrderListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderListService],
    }).compile();

    service = module.get<OrderListService>(OrderListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
