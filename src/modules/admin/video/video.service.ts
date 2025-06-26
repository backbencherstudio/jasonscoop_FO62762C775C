import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateVideoDto, } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { SojebStorage } from '../../../common/lib/Disk/SojebStorage';
import appConfig from '../../../config/app.config';

@Injectable()
export class VideoService {
  constructor(private prisma: PrismaService) {}

  async create(createVideoDto: CreateVideoDto) {
    try {
      // Upload video file
      await SojebStorage.put(
        appConfig().storageUrl.video + createVideoDto.videoFile.originalname,
        createVideoDto.videoFile.buffer,
      );
      // const videoPath = SojebStorage.url(
      //   appConfig().storageUrl.video + createVideoDto.videoFile.originalname,
      // );

      // Upload thumbnail
      await SojebStorage.put(
        appConfig().storageUrl.thumbnail + createVideoDto.thumbnailFile.originalname,
        createVideoDto.thumbnailFile.buffer,
      );
      // const thumbnailPath = SojebStorage.url(
      //   appConfig().storageUrl.thumbnail + createVideoDto.thumbnailFile.originalname,
      // );

      // Create video record in database
      const video = await this.prisma.video.create({
        data: {
          title: createVideoDto.title,
          category: createVideoDto.category.toLowerCase(),
          description: createVideoDto.description,
          video: createVideoDto.videoFile.originalname,
          thumbnail: createVideoDto.thumbnailFile.originalname,
          userId: createVideoDto.userId,
          orderId: createVideoDto.orderId
        },
      });

      await this.prisma.order.update({
        where:{id: createVideoDto.orderId},
        data : {working_status : createVideoDto.working_status}
      })

      return {
        success: true,
        message: 'video uploaded successfully'
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    const data = await this.prisma.video.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    // console.log(data)

    return data.map(category => ({
      ...category,
      videoUrl: category.video ? `${process.env.APP_URL}/storage/video/${category.video}` : null,
      thumbnailUrl: category.thumbnail ? `${process.env.APP_URL}/storage/thumbnail/${category.thumbnail}` : null
    }));
  }
}
