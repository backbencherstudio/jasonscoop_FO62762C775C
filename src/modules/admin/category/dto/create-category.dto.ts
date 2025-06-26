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
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
  
  @IsOptional()
  @IsNumber()
  reviewNumber: number;

  @ApiProperty({
    description: 'Category image file',
    type: 'string',
    format: 'binary',
  })
  image: any;
}
