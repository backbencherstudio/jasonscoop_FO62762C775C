import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReturnProductService } from './return-product.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Admin/Return-Product')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/return-product')
export class ReturnProductController {
  constructor(private readonly returnProductService: ReturnProductService) {}

  // @Post()
  // create(@Body() createReturnProductDto: CreateReturnProductDto) {
  //   return this.returnProductService.create(createReturnProductDto);
  // }

  @Get('new-request')
  @ApiOperation({ summary: 'Get all new return requests' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async newRequestToReturn(
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.returnProductService.findAllNewReturnItem(
      search, 
      startDate, 
      endDate,
      page,
      limit
    );
  }

  @Patch('approve/:id')
  @ApiOperation({ summary: 'Approve return request' })
  async approveReturn(@Param('id') id: string) {
    return this.returnProductService.updateReturnStatus(id, 'approved');
  }

  @Patch('decline/:id')
  @ApiOperation({ summary: 'Decline return request' })
  async declineReturn(@Param('id') id: string) {
    return this.returnProductService.updateReturnStatus(id, 'rejected');
  }

  @Get('resolved-request')
  @ApiOperation({ summary: 'Return Approved Data' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async resolvedReturn(
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.returnProductService.reslovedReturn(
      search, 
      startDate, 
      endDate,
      page,
      limit
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific return request details' })
  async findSpecificProductReturn(@Param('id') id: string) {
    return this.returnProductService.findOne(id);
  }
}
