import {
  IsInt,
  IsOptional,
  Min,
  Max,
  IsString,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryVerificationDto {
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

  @ApiProperty({
    required: false,
    example: '2025-02-10',
    description: 'Filter by exact date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    required: false,
    example: '2025-02-01',
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return undefined;
      return value; // Keep original string format
    } catch {
      return undefined;
    }
  })
  start_date?: string;

  @ApiProperty({
    required: false,
    example: '2025-02-28',
    description: 'Filter by end date (YYYY-MM-DD)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return undefined;
      return value; // Keep original string format
    } catch {
      return undefined;
    }
  })
  end_date?: string;

  @ApiProperty({
    required: false,
    example: 'name',
    description: "Sort by name ('name' for ascending, '-name' for descending)",
  })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiProperty({
    required: false,
    example: 'cm6vz95v90000n0gkmfeoridc',
    description: 'Cursor for pagination',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Page number (default: 1)',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiProperty({
    required: false,
    example: 10,
    description: 'Number of results per page (default: 10, max: 50)',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(50, { message: 'Limit must not be greater than 50' })
  limit?: number;
}
