import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, BadRequestException, UseGuards } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

@Controller('admin/video')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)

export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'videoFile', maxCount: 1 },
      { name: 'thumbnailFile', maxCount: 1 },
    ])
  )
  async create(
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFiles()
    files: {
      videoFile?: Express.Multer.File[];
      thumbnailFile?: Express.Multer.File[];
    },
  ) {
    try {
      // console.log("aaa",createVideoDto)

      if (!files.videoFile?.[0]) {
        throw new BadRequestException('Video file is required');
      }
      if (!files.thumbnailFile?.[0]) {
        throw new BadRequestException('Thumbnail file is required');
      }

      createVideoDto.videoFile = files.videoFile[0];
      createVideoDto.thumbnailFile = files.thumbnailFile[0];
      // console.log("bbbb",createVideoDto)
      return await this.videoService.create(createVideoDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  findAll() {
    try {
      return this.videoService.findAll();
    } catch (error) {
      return error.message
    }
  }

}
