import { Test, TestingModule } from '@nestjs/testing';
import { TrafficSourcesService } from './traffic-sources.service';

describe('TrafficSourcesService', () => {
  let service: TrafficSourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrafficSourcesService],
    }).compile();

    service = module.get<TrafficSourcesService>(TrafficSourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
