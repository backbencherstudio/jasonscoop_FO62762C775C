import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class NotificationSettingDto {
  @ApiProperty({
    description: 'Setting key',
    example: 'all_messages',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'Setting value',
    example: 'true',
  })
  @IsString()
  @IsIn(['true', 'false'])
  value: string;
}

export class UpdateNotificationSettingsDto {
  @ApiProperty({
    type: [NotificationSettingDto],
    description: 'Array of notification settings to update',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationSettingDto)
  settings: NotificationSettingDto[];
}
