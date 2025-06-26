import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OrderListService } from './order-list.service';
import { Role } from '../../../common/guard/role/role.enum';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('admin/order-list')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class OrderListController {
  constructor(private readonly orderListService: OrderListService) {}

  @Get()
  async findAll() {
    try {
      return this.orderListService.findAll();
    } catch (error) {
      return{
        success : false,
        message : error.message
      }
    }
  }

  @Get('/:id')
  async findItemById(@Param('id') id:string){
    try {
      const data = await this.orderListService.findItemById(id);
      return data;
    } catch (error) {
      return{
        success: false,
        message: error.message
      }      
    }
  }
}
