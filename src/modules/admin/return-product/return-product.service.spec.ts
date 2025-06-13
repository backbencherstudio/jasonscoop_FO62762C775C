import { Test, TestingModule } from '@nestjs/testing';
import { ReturnProductService } from './return-product.service';

describe('ReturnProductService', () => {
  let service: ReturnProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReturnProductService],
    }).compile();

    service = module.get<ReturnProductService>(ReturnProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
