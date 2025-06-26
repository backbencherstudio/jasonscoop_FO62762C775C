import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { use } from 'passport';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('videos')
  async findAllVideos(
    @Query('category') category?:string,
    @Query('search') search?:string,
    @Query('page') page: number = 1,
    @Query('limit') limit:number =12
  ) {
    try {
      return await this.homeService.findAllVideos(category, search, page , limit);
    } catch (error) {
      return error.message;
    }
  }

  @Get('videos/:id')
  async findVideoById(@Param('id') id: string) {
    try {
      return this.homeService.findVideoById(id);
    } catch (error) {
      return error.message;
    }
  }

  @Get('category')
  async findAllCategory(){
    try {
      return this.homeService.findAllCategory();
    } catch (error) {
      return error.message;
    }
  }
  
  @Get('category/:id')
  async findCategoryById(@Param('id') id: string) {
    try {
      const result = await this.homeService.findCategoryById(id);
      if (!result) {
        return { message: 'Category not found' };  // Return message if no category found
      }
      return result;
    } catch (error) {
      console.error(error);  // Log the error for more context
      return { message: error.message };
    }
  }

}
