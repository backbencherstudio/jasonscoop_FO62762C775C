import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReportSortBy {
  DATE = 'date',
  TYPE = 'type',
  FORMAT = 'format'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export enum ReportTypeFilter {
  ALL = 'all',
  TRANSACTION = 'transaction',
  ORDER = 'order'
}

export class ReportFilterDto {
  @ApiPropertyOptional({
    description: 'Search query for report names',
    example: 'transaction'
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering',
    example: '2025-02-14'
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering',
    example: '2025-02-15'
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by report type',
    enum: ReportTypeFilter,
    default: ReportTypeFilter.ALL
  })
  @IsOptional()
  @IsEnum(ReportTypeFilter)
  type?: ReportTypeFilter = ReportTypeFilter.ALL;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ReportSortBy,
    default: ReportSortBy.DATE
  })
  @IsOptional()
  @IsEnum(ReportSortBy)
  sortBy?: ReportSortBy = ReportSortBy.DATE;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cursor for pagination'
  })
  @IsOptional()
  @IsString()
  cursor?: string;
} 