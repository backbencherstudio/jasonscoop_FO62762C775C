import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { DateHelper } from '../../../common/helper/date.helper';

@Injectable()
export class CategoryService extends PrismaClient {
  constructor(private prisma: PrismaService) {
    super();
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      // Trim whitespace from name and description
      const name = createCategoryDto.name?.trim();
      const description = createCategoryDto.description?.trim();
      
      const data = {
        name,
        description,
        image: createCategoryDto.image,
        price: createCategoryDto.price,
        deliveryTIme: createCategoryDto.deliveryTIme,
        rating: createCategoryDto.rating,
        reviewNumber: createCategoryDto.reviewNumber
      };
      const response = await this.prisma.category.create({
        data
      });
      
      return {
        data: response,
        success: true,
        message: 'Category created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findAll({ q = null, status = null }: { q?: string; status?: number }) {
    try {
      const whereClause = {};
      if (q) {
        whereClause['OR'] = [{ name: { contains: q, mode: 'insensitive' } }];
      }
      if (status) {
        whereClause['status'] = Number(status);
      }

      const categories = await this.prisma.category.findMany({
        where: { ...whereClause },
        select: {
          id: true,
          name: true,
          created_at: true,
          updated_at: true,
        },
      });

      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id: id },
        select: {
          id: true,
          name: true,
          created_at: true,
          updated_at: true,
        },
      });
      return {
        success: true,
        data: category,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      // check if category already exists
      const category = await this.prisma.category.findFirst({
        where: { name: updateCategoryDto.name },
      });
      if (category) {
        return {
          success: false,
          message: 'Category already exists',
        };
      }
      await this.prisma.category.update({
        where: { id: id },
        data: {
          ...updateCategoryDto,
          updated_at: DateHelper.now(),
        },
      });
      return {
        success: true,
        message: 'Category updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.category.delete({
        where: { id: id },
      });
      return {
        success: true,
        message: 'Category deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
