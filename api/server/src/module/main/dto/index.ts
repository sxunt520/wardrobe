import { IsString, IsOptional, MinLength, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}

export class LoginDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  userName: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  password: string;

  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString()
  uuid?: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nickName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(50)
  email?: string;
}

export class WechatLoginDto {
  @ApiProperty({ required: true, description: 'wx.login 返回的 code' })
  @IsString()
  code: string;

  @ApiProperty({ required: false, description: '微信昵称，可选' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nickName?: string;

  @ApiProperty({ required: false, description: '微信头像，可选' })
  @IsOptional()
  @IsString()
  avatar?: string;
}
