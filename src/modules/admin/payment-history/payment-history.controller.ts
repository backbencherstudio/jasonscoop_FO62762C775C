import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PaymentHistoryService } from './payment-history.service';
import { CreatePaymentHistoryDto } from './dto/create-payment-history.dto';
import { UpdatePaymentHistoryDto } from './dto/update-payment-history.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Role } from 'src/common/guard/role/role.enum';
import { Roles } from 'src/common/guard/role/roles.decorator';

@Controller('admin/payment-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PaymentHistoryController {
  constructor(private readonly paymentHistoryService: PaymentHistoryService) {}

  

  @Get()
  findAll() {
    try {
      return this.paymentHistoryService.findAll();
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  }

  
}
