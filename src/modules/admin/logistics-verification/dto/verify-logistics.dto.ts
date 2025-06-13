import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyLogisticsDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'admin_id_here',
    description: 'ID of the admin verifying the logistics user',
  })
  approved_by: string;
}
