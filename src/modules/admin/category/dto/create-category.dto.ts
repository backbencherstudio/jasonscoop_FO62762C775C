import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, Max, Min } from 'class-validator';

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

  @IsOptional()
  @IsString()
  price: string;
  
  @IsOptional()
  @IsString()
  deliveryTIme: string;
  
  @IsOptional()
  @IsString()
  rating: string;
  
  @IsOptional()
  @IsString()
  reviewNumber: string;

  @ApiProperty({
    description: 'Category image file',
    type: 'string',
    format: 'binary',
  })
  image: any;
}
