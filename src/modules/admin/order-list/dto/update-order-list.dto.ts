import { PartialType } from '@nestjs/swagger';
import { CreateOrderListDto } from './create-order-list.dto';

export class UpdateOrderListDto extends PartialType(CreateOrderListDto) {}
