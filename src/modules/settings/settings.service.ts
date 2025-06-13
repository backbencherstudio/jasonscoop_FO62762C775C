import { Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';


interface NotificationSetting {
  category: string;
  key: string;
  label: string;
  description: string;
  default_value: string;
}

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async create(createSettingDto: CreateSettingDto) {
    try {
      const setting = await this.prisma.setting.create({
        data: createSettingDto,
      });
      return {
        success: true,
        data: setting,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async update(id: string, updateSettingDto: UpdateSettingDto) {
    try {
      const setting = await this.prisma.setting.update({
        where: { id },
        data: updateSettingDto,
      });
      return {
        success: true,
        data: setting,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async  notificationService(userId: string) {
    try {
      const notificationSettings: NotificationSetting[] = [
        {
          category: 'notification',
          key: 'all_messages',
          label: 'All Messages',
          description: 'Send me notification alerts on all messages',
          default_value: 'false',
        },
        {
          category: 'notification',
          key: 'all_tickets',
          label: 'All Tickets',
          description: 'Send me notification alerts on all tickets',
          default_value: 'false',
        },
        {
          category: 'notification',
          key: 'payment_notifications',
          label: 'Payment Notifications',
          description:
            'Send me notification alerts for all payments and withdrawals',
          default_value: 'false',
        },
        {
          category: 'notification',
          key: 'orders',
          label: 'Orders',
          description: 'Send me notification alerts on every order',
          default_value: 'false',
        },
        {
          category: 'notification',
          key: 'ratings_reviews',
          label: 'Ratings & Reviews',
          description: 'Send me notification alerts on every review received',
          default_value: 'false',
        },
        {
          category: 'notification',
          key: 'system_updates',
          label: 'System Updates',
          description: 'Send me notification alerts on new system updates',
          default_value: 'false',
        },
      ];

      // Ensure all settings exist in the database
      for (const setting of notificationSettings) {
        await this.prisma.setting.upsert({
          where: { key: setting.key },
          update: {
            category: setting.category,
            label: setting.label,
            description: setting.description,
            default_value: setting.default_value,
          },
          create: setting,
        });
      }

      // Get all notification settings with user preferences
      const settings = await this.prisma.setting.findMany({
        where: {
          category: 'notification',
        },
        include: {
          user_settings: {
            where: {
              user_id: userId,
            },
          },
        },
      });

      // Format the response
      const formattedSettings = settings.map((setting) => ({
        id: setting.id,
        key: setting.key,
        label: setting.label,
        description: setting.description,
        value: setting.user_settings[0]?.value || setting.default_value,
      }));

      return {
        success: true,
        data: formattedSettings,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async updateNotificationSettings(
    userId: string,
    settings: UpdateNotificationSettingsDto['settings'],
  ) {
    try {
      const updates = settings.map(async (setting) => {
        const dbSetting = await this.prisma.setting.findUnique({
          where: { key: setting.key },
        });

        if (!dbSetting) {
          throw new Error(`Setting with key ${setting.key} not found`);
        }

        // First try to find existing setting
        const existingSetting = await this.prisma.userSetting.findFirst({
          where: {
            user_id: userId,
            setting_id: dbSetting.id,
          },
        });

        if (existingSetting) {
          // Update if exists
          return this.prisma.userSetting.update({
            where: { id: existingSetting.id },
            data: { value: setting.value },
          });
        } else {
          // Create if doesn't exist
          return this.prisma.userSetting.create({
            data: {
              user_id: userId,
              setting_id: dbSetting.id,
              value: setting.value,
            },
          });
        }
      });

      await Promise.all(updates);

      return {
        success: true,
        message: 'Notification settings updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // update personal info
  async personalInfoService(userId: string, updatePersonalInfoDto: UpdatePersonalInfoDto) {
    try {
      
      // Step 1: Find the user by ID
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      
      // Step 2: Check if the user exists
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      if(!updatePersonalInfoDto){
        return {
          success: false,
          message: 'Data not found',
        };
      }

      // Step 3: Update the user information
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          first_name: updatePersonalInfoDto.first_name,
          last_name: updatePersonalInfoDto.last_name,
          email: updatePersonalInfoDto.email,
          phone_number: updatePersonalInfoDto.phone_number,
          country: updatePersonalInfoDto.country,
          state: updatePersonalInfoDto.state,
          city: updatePersonalInfoDto.city,
          local_government: updatePersonalInfoDto.local_government,
          address: updatePersonalInfoDto.address,
          zip_code: updatePersonalInfoDto.zip_code,
          avatar: updatePersonalInfoDto.avatar,
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true,
          country: true,
          state: true,
          city: true,
          local_government: true,
          address: true,
          zip_code: true,
          avatar: true,
        },
      });
      return {
        success: true,
        data: updatedUser,
      };
    } catch (error) {
      // console.error("Error updating user:", error); // Log the error for debugging
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // change password
  // async changePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
  //   try {
  //     const user = await this.prisma.user.findUnique({
  //       where: { id: userId },
  //     });

  //     if (!user) {
  //       return {
  //         success: false,
  //         message: 'User not found',
  //       }; 
  //     }

  //     if(!updatePasswordDto){
  //       return {
  //         success: false,
  //         message: 'Data not found',
  //       };
  //     } 

  //     // Check if the current password is correct
  //     const isPasswordCorrect = await bcrypt.compare(
  //       updatePasswordDto.current_password,
  //       user.password,
  //     ); 

  //     if(!isPasswordCorrect){
  //       return {
  //         success: false,
  //         message: 'Current password is incorrect',
  //       }; 
  //     }

  //     // Hash the new password
  //     const hashedPassword = await bcrypt.hash(updatePasswordDto.new_password, 10);

  //     // Update the user's password
  //     const updatedUser = await this.prisma.user.update({ 
  //       where: { id: userId },
  //       data: { password: hashedPassword },
  //     });

  //     return {
  //       success: true,
  //       message: 'Password updated successfully',
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }
}
// user6@example.com