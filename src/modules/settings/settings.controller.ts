import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SettingsService } from './settings.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { Request } from 'express';
import UpdatePasswordDto from './dto/update-password.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification settings' })
  @UseGuards(JwtAuthGuard)
  @Get('notification')
  async notificationSetting(@GetUser('id') userId: string) {
    try {
      return await this.settingsService.notificationService(userId);
    } catch (error) {
      return {
        success: false,
        message: 'error fetching',
      };
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification settings' })
  @UseGuards(JwtAuthGuard)
  @Post('notification')
  async updateNotificationSettings(
    @GetUser('id') userId: string,
    @Body() updateDto: UpdateNotificationSettingsDto,
  ) {
    return await this.settingsService.updateNotificationSettings(
      userId,
      updateDto.settings,
    );
  }

  // it will get all the info of the user by id,and they are able to update their data:image, firstname, last name,email,phone number, personal address(country, state, city, local goverment, address, postal code) 
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update personal information' })
  @UseGuards(JwtAuthGuard)
  @Patch('personal-info')
  async personalInfoSetting(
    @GetUser('userId') userId: string,
    @Req() req: Request,
    @Body() updatePersonalInfoDto: UpdatePersonalInfoDto,
  ) {
    try {
      // return req.user;
      return await this.settingsService.personalInfoService(userId, updatePersonalInfoDto);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  //  change password setting 
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Change password' })
  // @UseGuards(JwtAuthGuard)
  // @Patch('change-password')
  // async changePasswordSettings(
  //   @GetUser('userId') userId: string,
  //   @Body() updatePasswordDto: UpdatePasswordDto
  // ) {
  //   try {
  //     console.log( "userId",userId, "updatePasswordDto",updatePasswordDto);
  //     return await this.settingsService.changePassword(userId, updatePasswordDto);
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }

  
}


