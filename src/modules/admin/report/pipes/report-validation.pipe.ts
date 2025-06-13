// Implement custom validation pipe for report requests 
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { CreateReportDto } from '../dto/create-report.dto';

@Injectable()
export class ReportValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value.date_from) {
      throw new BadRequestException('date_from is required');
    }

    try {
      // Dates are already transformed by class-transformer
      if (value.date_to && value.date_from > value.date_to) {
        throw new BadRequestException('date_to cannot be before date_from');
      }

      return value;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid date format');
    }
  }
} 