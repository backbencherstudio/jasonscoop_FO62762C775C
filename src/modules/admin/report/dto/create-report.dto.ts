import { IsEnum, IsDateString, IsOptional, ValidateIf } from 'class-validator';
import { ReportFormat } from '../types/report.types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// Base DTO for preview operations
export class PreviewReportDto {
  @ApiProperty({
    description: 'Date for single day report or start date for date range',
    example: '2024-03-14',
  })
  @IsDateString()
  @Transform(({ value }) => value ? value : undefined)
  date_from: string;

  @ApiPropertyOptional({
    description: 'End date for date range (optional)',
    example: '2024-03-15'
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? value : undefined)
  @ValidateIf((o) => o.date_to !== undefined && o.date_to !== '')
  date_to?: string;
}

// Extended DTO for download operations
export class CreateReportDto extends PreviewReportDto {
  @ApiProperty({
    description: 'Report format',
    enum: ReportFormat,
    example: 'pdf'
  })
  @IsEnum(ReportFormat)
  format: ReportFormat;
}

export class CreateTransactionReportDto extends CreateReportDto {}
export class CreateOrderReportDto extends CreateReportDto {}

export class PreviewTransactionReportDto extends PreviewReportDto {}
export class PreviewOrderReportDto extends PreviewReportDto {} 