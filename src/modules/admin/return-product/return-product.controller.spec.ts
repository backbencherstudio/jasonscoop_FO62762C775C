import { Test, TestingModule } from '@nestjs/testing';
import { ReturnProductController } from './return-product.controller';
import { ReturnProductService } from './return-product.service';

describe('ReturnProductController', () => {
  let controller: ReturnProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnProductController],
      providers: [ReturnProductService],
    }).compile();

    controller = module.get<ReturnProductController>(ReturnProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
