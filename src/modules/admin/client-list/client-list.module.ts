import { Module } from '@nestjs/common';
import { ClientListService } from './client-list.service';
import { ClientListController } from './client-list.controller';

@Module({
  controllers: [ClientListController],
  providers: [ClientListService],
})
export class ClientListModule {}
