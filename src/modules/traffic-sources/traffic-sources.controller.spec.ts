import { Test, TestingModule } from '@nestjs/testing';
import { TrafficSourcesController } from './traffic-sources.controller';
import { TrafficSourcesService } from './traffic-sources.service';

describe('TrafficSourcesController', () => {
  let controller: TrafficSourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrafficSourcesController],
      providers: [TrafficSourcesService],
    }).compile();

    controller = module.get<TrafficSourcesController>(TrafficSourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
