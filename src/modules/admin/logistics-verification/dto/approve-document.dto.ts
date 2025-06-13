import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveDocumentDto {
  @ApiProperty({
    required: false,
    description: 'User role (logistic_agent/logistic_manager)',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({
    required: false,
    description: 'Search query for name or email',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false, description: 'Cursor ID for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    required: false,
    example: 10,
    description: 'Number of results per request (default: 10)',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(50, { message: 'Limit must not be greater than 50' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Document ID to approve/reject',
    example: 'doc_123',
  })
  @IsString()
  @IsNotEmpty()
  document_id: string;
}
