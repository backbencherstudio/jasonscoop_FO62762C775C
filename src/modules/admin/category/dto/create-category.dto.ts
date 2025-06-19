import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Category name',
    example: 'Family Package',
  })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Category description',
    example: 'Family vacation packages',
  })
  description: string;

  @ApiProperty({
    description: 'Category image file',
    type: 'string',
    format: 'binary',
  })
  image: any;
}
