import { ApiProperty } from '@nestjs/swagger';

export class AddNewUserDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone_number: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ required: false })
  gender?: string;

  @ApiProperty({ required: false })
  status?: number;
} 