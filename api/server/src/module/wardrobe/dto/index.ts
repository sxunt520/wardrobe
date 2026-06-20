import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PagingDto } from 'src/common/dto';

export class UpsertProfileDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsInt()
  height?: number;

  @IsOptional()
  @IsInt()
  weight?: number;

  @IsOptional()
  @IsString()
  bodyShape?: string;

  @IsOptional()
  @IsString()
  skinTone?: string;

  @IsOptional()
  @IsArray()
  stylePreferences?: string[];

  @IsOptional()
  @IsArray()
  avoidColors?: string[];

  @IsOptional()
  @IsArray()
  brandPreferences?: string[];
}

export class ClothingQueryDto extends PagingDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsString()
  isFrequent?: string;
}

export class WardrobePageQueryDto extends PagingDto {}

export class CreateClothingDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  texture?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsBoolean()
  isFrequent?: boolean;
}

export class AnalyzeClothingDto {
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  hint?: string;
}

export class GenerateOutfitDto {
  @IsOptional()
  @IsString()
  scene?: string;

  @IsOptional()
  @IsString()
  weather?: string;

  @IsOptional()
  @IsInt()
  temperature?: number;

  @IsOptional()
  @IsArray()
  clothingIds?: string[];
}

export class SaveOutfitDto {
  @IsBoolean()
  isSaved: boolean;
}

export class StartTryOnDto {
  @IsString()
  personImageUrl: string;
}

export class ScoreChallengeDto {
  @IsString()
  challengeId: string;

  @IsOptional()
  @IsArray()
  colors?: string[];

  @IsOptional()
  @IsString()
  style?: string;
}

export class CreateSubmissionDto {
  @IsOptional()
  @IsString()
  challengeId?: string;

  @IsString()
  title: string;

  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  content?: string;
}

export class CreateFeedbackDto {
  @IsOptional()
  @IsString()
  feedbackType?: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  contact?: string;
}
