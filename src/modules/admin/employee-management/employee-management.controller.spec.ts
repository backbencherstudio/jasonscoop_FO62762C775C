import { Test, TestingModule } from '@nestjs/testing';
import { ManagementController } from './employee-management.controller';
import { ManagementService } from './employee-management.service';

describe('ManagementController', () => {
  let controller: ManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagementController],
      providers: [ManagementService],
    }).compile();

    controller = module.get<ManagementController>(ManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
