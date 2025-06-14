// src/modules/admin/video/dto/create-video.dto.ts
import { IsString, IsEnum } from 'class-validator';



export class CreateVideoDto {
  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsString()
  description: string;

  @IsString()
  status: string;

  // Remove all validation decorators for these:
  videoFile?: Express.Multer.File;
  thumbnailFile?: Express.Multer.File;
}