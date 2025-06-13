import { Controller, Get, Query, Delete, Param, Post, Body } from '@nestjs/common';
import { ManagementService } from './employee-management.service';
import { ApiQuery, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AddNewUserDto } from './dto/add-new-user.dto';
import { GetQueryDto } from './dto/query.dto';

@ApiTags('Employee Management')
@Controller('management')
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  // companies
  @Get('companies')
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['default', 'total_no_of_fulfillment', 'rating'],
    description: 'Sort by options: default, total_no_of_fulfillment, rating',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order: asc or desc',
  })
  findAllCompanies(
    @Query()
    query: GetQueryDto
  ) {
    return this.managementService.findAllCompanies({
      filters: {
        q: query.q,
        cursor: query.cursor,
        page: query.page,
        limit: query.limit, 
        startDate: query.startDate,
        endDate: query.endDate,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder
      },
    });
  }

  // add new company button will take user data from body and save the data to the user model
  // data: email,phone number, password, type: logistic_manager  
  @Post('companies/add-new-company')
  @ApiOperation({ summary: 'Add a new company' })
  @ApiBody({ type: AddNewUserDto })
  async addNewCompany(@Body() data: AddNewUserDto) {
    try {
      return await this.managementService.addNewCompany(data);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }


  // add new agent will take the user data from the body and will save the data to the user model
  // data: email,phone number, password, type: logistic_agent
  @Post('individual-agents/add-new-agent')
  @ApiOperation({ summary: 'Add a new agent' })
  @ApiBody({ type: AddNewUserDto })
  async addNewAgent(@Body() data: AddNewUserDto) {
    try {
      return await this.managementService.addNewAgent(data);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // add new vendor button will take the user data from the body and will save the data to the user model
  // data: email,phone number, password, type: vendor
  @Post('vendors/add-new-vendor')
  @ApiOperation({ summary: 'Add a new vendor' })
  @ApiBody({ type: AddNewUserDto })
  async addNewVendor(@Body() data: AddNewUserDto) {
    try {
      return await this.managementService.addNewVendor(data);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // add-new-support-member button will take the user data from the body and will save the data to the user model
  // data: email,phone number, password, type:vendor
  @Post('support-team/add-new-support-member')
  @ApiOperation({ summary: 'Add a new support team member' })
  @ApiBody({ type: AddNewUserDto })
  async addNewSupportMember(@Body() data: AddNewUserDto) {
    try {
      return await this.managementService.addNewSupportMember(data);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // individual-agents
  @Get('individual-agents')
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['default', 'total_no_of_fulfillment', 'rating'],
    description: 'Sort by options: default, total_no_of_fulfillment, rating',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order: asc or desc',
  })
  async findIndividualAgents(
    @Query()
    query: GetQueryDto
  ) {
    try {
      return await this.managementService.findAllIndividualAgents({
        filters: {
          q: query.q,
          cursor: query.cursor,
          page: query.page,
          limit: query.limit,
          startDate: query.startDate,
          endDate: query.endDate,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder || 'desc',
        },
      });
    } catch (error) {
      throw new Error(`Failed to retrieve individual agents: ${error.message}`);
    }
  }


  // vendors
  @Get('vendors')
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['default', 'no_of_products', 'rating'],
    description: 'Sort by options: default, no_of_products, rating',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order: asc or desc',
  })
  async findVendors(
    @Query()
    query: GetQueryDto
  ) {
    try {
      return await this.managementService.findAllVendors({
        filters: {
          q: query.q,
          cursor: query.cursor,
          page: query.page ,
          limit: query.limit,
          startDate: query.startDate,
          endDate: query.endDate,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder || 'desc',
        },
      });
    } catch (error) {
      throw new Error(`Failed to retrieve vendors: ${error.message}`);
    }
  }


  // support team
@Get('support-team')
@ApiQuery({ name: 'q', required: false })
@ApiQuery({ name: 'cursor', required: false })
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'limit', required: false, type: Number })
@ApiQuery({ 
  name: 'sortBy', 
  required: false, 
  enum: ['default', 'tickets_resolved', 'rating'],
  description: 'Sort by options: default, tickets_resolved, rating'
})
@ApiQuery({ 
  name: 'sortOrder', 
  required: false, 
  enum: ['asc', 'desc'],
  description: 'Sort order: asc or desc'
})
async findSupportTeam(
  @Query() query: GetQueryDto
) {
  try {
    return await this.managementService.findAllSupportTeam({
      filters: {
        q: query.q,
        cursor: query.cursor,
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder || 'desc',
      }
    });
  } catch (error) {
    throw new Error(`Failed to retrieve support team: ${error.message}`);
  }
}


// delete users by their by
@Delete('users/:id')
async deleteUser(@Param('id') id: string) {
  try{
    return await this.managementService.deleteUser(id);
  }catch(error){
    return {
      "success": false,
      "message": error.message
    }
  }
}
}


 