import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { SojebStorage } from '../../../common/lib/Disk/SojebStorage';
import appConfig from '../../../config/app.config';

@Injectable()
export class PageService extends PrismaClient {
  constructor(private prisma: PrismaService) {
    super();
  }

  async homePage() {
    try {
      const reviews = await this.prisma.review.findMany({
        where: {
          status: 1,
        },
        take: 6,
        select: {
          id: true,
          rating_value: true,
          comment: true,
          user_id: true,
        },
      });

      const blogs = await this.prisma.blog.findMany({
        where: {
          status: 1,
          approved_at: {
            not: null,
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 3,
        select: {
          id: true,
          title: true,
          description: true,
          read_time: true,
          blog_images: {
            select: {
              image: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // add avatar url
      if (blogs && blogs.length > 0) {
        for (const blog of blogs) {
          if (blog.user && blog.user.avatar) {
            blog.user['avatar_url'] = SojebStorage.url(
              appConfig().storageUrl.avatar + blog.user.avatar,
            );
          }
        }
      }

      // add image url blog_images
      if (blogs && blogs.length > 0) {
        for (const blog of blogs) {
          if (blog.blog_images && blog.blog_images.length > 0) {
            for (const image of blog.blog_images) {
              image['image_url'] = SojebStorage.url(
                appConfig().storageUrl.blog + image.image,
              );
            }
          }
        }
      }

      const faqs = await this.prisma.faq.findMany({
        orderBy: {
          sort_order: 'asc',
        },
        select: {
          id: true,
          question: true,
          answer: true,
        },
      });

      return {
        success: true,
        data: {
          reviews: reviews,
          blogs: blogs,
          faqs: faqs,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
