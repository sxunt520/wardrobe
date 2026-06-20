import { IsOptional, IsString } from 'class-validator';
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
