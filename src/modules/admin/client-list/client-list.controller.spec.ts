import { Test, TestingModule } from '@nestjs/testing';
import { ClientListController } from './client-list.controller';
import { ClientListService } from './client-list.service';

describe('ClientListController', () => {
  let controller: ClientListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientListController],
      providers: [ClientListService],
    }).compile();

    controller = module.get<ClientListController>(ClientListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
