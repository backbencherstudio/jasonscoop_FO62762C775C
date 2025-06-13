import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUrl, IsEnum, IsBoolean, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportListItemDto {
  @ApiProperty({
    description: 'Name of the report',
    example: 'All Orders List',
    enum: ['All Orders List', 'Transaction Reports']
  })
  @IsEnum(['All Orders List', 'Transaction Reports'])
  name: string;

  @ApiProperty({
    description: 'Report date or date range',
    example: '2025-02-14 to 2025-02-15',
  })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Report format',
    example: 'pdf'
  })
  @IsString()
  format: string;

  @ApiProperty({
    description: 'URL to download the report',
    example: 'http://example.com/reports/order-report.pdf'
  })
  @IsUrl()
  file_url: string;
}

export class PaginationDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  current_page: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5
  })
  total_pages: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 50
  })
  total_items: number;

  @ApiPropertyOptional({
    description: 'Cursor for next page',
    example: 'cursor_123'
  })
  cursor?: string;
}

export class ReportListResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true
  })
  @IsBoolean()
  success: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto
  })
  pagination: PaginationDto;

  @ApiProperty({
    description: 'List of reports',
    type: [ReportListItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportListItemDto)
  data: ReportListItemDto[];
} 