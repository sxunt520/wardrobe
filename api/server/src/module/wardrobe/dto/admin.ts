import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PagingDto } from 'src/common/dto';

export class WardrobeAdminQueryDto extends PagingDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class SaveStyleChallengeDto {
  @IsOptional()
  @IsUUID('4', { message: '挑战ID格式不正确' })
  challengeId?: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: '挑战标签格式不正确' })
  @IsNotEmpty({ message: '挑战标签不能为空' })
  @MaxLength(64, { message: '挑战标签不能超过64个字符' })
  tag: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: '挑战标题格式不正确' })
  @IsNotEmpty({ message: '挑战标题不能为空' })
  @MaxLength(120, { message: '挑战标题不能超过120个字符' })
  title: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: '奖励格式不正确' })
  @MaxLength(64, { message: '奖励不能超过64个字符' })
  reward?: string;

  @IsOptional()
  @IsArray({ message: '主题色必须是数组' })
  @IsString({ each: true, message: '主题色格式不正确' })
  colors?: string[];
}
