import { PartialType } from '@nestjs/swagger';
import { CreateReturnProductDto } from './create-return-product.dto';

export class UpdateReturnProductDto extends PartialType(
  CreateReturnProductDto,
) {}
