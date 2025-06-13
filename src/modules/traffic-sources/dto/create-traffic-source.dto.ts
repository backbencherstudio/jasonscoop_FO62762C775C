import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrafficSourceDto {
  @ApiProperty({
    description: 'Source of the traffic (e.g., facebook, instagram, twitter)',
    example: 'facebook',
  })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({
    description: 'Referrer URL',
    example: 'https://www.facebook.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  referrer?: string;
}
