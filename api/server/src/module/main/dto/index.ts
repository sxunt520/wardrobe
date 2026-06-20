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
