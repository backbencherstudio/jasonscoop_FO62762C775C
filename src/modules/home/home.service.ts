import { Injectable } from '@nestjs/common';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  async findAllVideos(
    category?: string,
    search?: string,
    page: number = 1,
    limit: number = 12
  ) {
    try {    
      const whereCondition: any = {}; // Explicitly type the where condition
      
      // Add category condition if provided
      if (category && category.toLowerCase() !== 'all') {
        whereCondition.category = category;
      }
      
      // Add search condition if provided
      if (search) {
        whereCondition.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
  
      // Validate page and limit
      page = Math.max(1, page);
      limit = Math.max(1, Math.min(limit, 100)); // Limit max results to 100 per page
      
      const skip = (page - 1) * limit;
      
      const [data, totalCount] = await Promise.all([
        this.prisma.video.findMany({
          where: whereCondition,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.video.count({ where: whereCondition })
      ]);
  
      return {
        data: data.map(category => ({
          ...category,
          videoUrl: category.video ? `${process.env.APP_URL}/storage/video/${category.video}` : null,
          thumbnailUrl: category.thumbnail ? `${process.env.APP_URL}/storage/thumbnail/${category.thumbnail}` : null
        })),
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      console.error("Error fetching videos:", error);
      throw new Error('Unable to fetch videos');
    }
  }
  
  
  

  async findVideoById(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id }
    });
    
    return {
      ...video,
      videoUrl: video?.video? `${process.env.APP_URL}/storage/video/${video.video}` : null,
      thumbnailUrl: video?.thumbnail ? `${process.env.APP_URL}/storage/thumbnail/${video.thumbnail}` : null
    };
  }

  async findAllCategory(){
    const data = await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        image: true  // Include the image field
      }
    });
    
    // Add full URL to each image
    return data.map(category => ({
      ...category,
      imageUrl: category.image ? `${process.env.APP_URL}/storage/categories/${category.image}` : null
    }));
  }

  async findCategoryById(id:string){
    const result = await this.prisma.category.findUnique({
      where: { id: id }  // Pass the string ID directly
    });

    if (!result) {
      console.log('No category found with this ID');
      return { message: 'Category not found' };  // You can return an appropriate message
    }

    return {
      ...result,
      imageUrl: result.image? `${process.env.APP_URL}/storage/categories/${result.image}` : null
    }
  }
}
