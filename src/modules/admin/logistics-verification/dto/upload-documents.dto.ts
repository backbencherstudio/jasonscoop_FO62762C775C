import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  IsIn,
} from 'class-validator';

export class UploadDocumentsDto {
  @ApiProperty({
    type: [String],
    description: 'Array of document types',
    example: ['passport', 'driving_license', 'id_card'],
  })
  @IsArray({ message: 'types must be an array' }) // ✅ Ensure 'types' is an array
  @ArrayMinSize(3, {
    message: 'You must provide exactly three document types.',
  })
  @ArrayMaxSize(3, { message: 'Only three document types are allowed.' })
  @IsIn(['passport', 'driving_license', 'id_card'], {
    each: true,
    message:
      'Each value in types must be one of the following: passport, driving_license, id_card',
  })
  types: string[];
}
