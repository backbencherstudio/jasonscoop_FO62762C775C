import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClientListService } from './client-list.service';
import { Role } from '../../../common/guard/role/role.enum';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('admin/client-list')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ClientListController {
  constructor(private readonly clientListService: ClientListService) {}

  @Get()
  async findAll() {
    try {
      return this.clientListService.findAll();
    } catch (error) {
      return{
        success : false,
        message : error.message
      }
    }
  }
}
