import { ReportType, ReportFormat, ReportStatus } from '../types/report.types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Create separate classes for nested objects
class ReportDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ReportType })
  report_type: ReportType;

  @ApiProperty()
  date_from: Date;

  @ApiPropertyOptional()
  date_to?: Date;

  @ApiProperty({ enum: ReportFormat })
  format: ReportFormat;

  @ApiPropertyOptional()
  file_url?: string;

  @ApiProperty({ enum: ReportStatus })
  status: ReportStatus;
}

class TransactionReportDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  transaction_id: string;

  @ApiProperty()
  transaction_date: Date;

  @ApiProperty()
  transaction_status: string;

  @ApiProperty()
  transaction_amount: number;

  @ApiProperty()
  transaction_provider: string;

  @ApiPropertyOptional()
  invoice_number?: string;

  @ApiPropertyOptional()
  order_date_time?: Date;

  @ApiPropertyOptional()
  total_amount?: number;

  @ApiPropertyOptional()
  store_name?: string;

  @ApiPropertyOptional()
  customer_name?: string;

  @ApiPropertyOptional()
  customer_email?: string;

  @ApiPropertyOptional()
  file_url?: string;

  @ApiProperty()
  format: string;
}

class OrderReportDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order_id: string;

  @ApiPropertyOptional()
  invoice_number?: string;

  @ApiProperty()
  order_date_time: Date;

  @ApiProperty()
  total_amount: number;

  @ApiPropertyOptional()
  customer_name?: string;

  @ApiPropertyOptional()
  customer_email?: string;

  @ApiPropertyOptional()
  store_name?: string;

  @ApiProperty()
  product_id: string;

  @ApiPropertyOptional()
  product_name?: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  product_price: number;

  @ApiPropertyOptional()
  file_url?: string;

  @ApiProperty()
  format: string;
}

// Base response type
class BaseResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Error message if operation failed',
    example: 'Failed to generate report',
  })
  message?: string;
}

// Download response types
export class DownloadReportDataDto {
  @ApiProperty({
    description: 'Generated report file URL',
    example: 'https://storage.example.com/reports/report-2024-03-14.pdf',
  })
  file_url: string;

  @ApiProperty({
    description: 'Report ID in database',
    example: 'rep_123abc',
  })
  report_id: string;

  @ApiProperty({
    description: 'Report format',
    enum: ReportFormat,
    example: 'pdf',
  })
  format: ReportFormat;

  @ApiProperty({
    description: 'Report generation date',
    example: '2024-03-14T12:00:00Z',
  })
  generated_at: Date;
}

export class TransactionReportDownloadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  data?: {
    file_url: string;
    report_id: string;
    format: ReportFormat;
    generated_at: Date;
    transaction_count: number;
  } | null;
}

export class OrderReportDownloadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  data?: {
    file_url: string;
    report_id: string;
    format: ReportFormat;
    generated_at: Date;
    order_count: number;
  } | null;
}

// Preview response types
export class PreviewReportResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'PDF Buffer for preview',
    type: 'string',
    format: 'binary',
  })
  data: Buffer;
}

export class TransactionReportPreviewResponseDto extends PreviewReportResponseDto {}
export class OrderReportPreviewResponseDto extends PreviewReportResponseDto {}

export class ReportResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Report data',
    type: ReportDataDto,
  })
  data?: ReportDataDto;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  error?: string;
}

export class TransactionReportResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Transaction report data',
    type: TransactionReportDataDto,
  })
  data?: TransactionReportDataDto;

  @ApiPropertyOptional({
    description: 'Success message',
    example: 'Report generated successfully',
  })
  message?: string;

  @ApiPropertyOptional()
  error?: string;
}

export class OrderReportResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Order report data',
    type: OrderReportDataDto,
  })
  data?: OrderReportDataDto;

  @ApiPropertyOptional({
    description: 'Success message',
    example: 'Report generated successfully',
  })
  message?: string;

  @ApiPropertyOptional()
  error?: string;
}
