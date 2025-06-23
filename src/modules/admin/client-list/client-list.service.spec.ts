import { Test, TestingModule } from '@nestjs/testing';
import { ClientListService } from './client-list.service';

describe('ClientListService', () => {
  let service: ClientListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientListService],
    }).compile();

    service = module.get<ClientListService>(ClientListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
