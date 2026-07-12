export interface ApiResponse<T> {
  code?: number;
  msg?: string;
  message?: string;
  data?: T;
}

export interface UserInfo {
  userId: number;
  userName: string;
  nickName?: string;
  avatar?: string;
}

export interface ClothingItem {
  id?: string;
  clothingId?: string;
  name: string;
  category: string;
  color?: string;
  texture?: string;
  brand?: string;
  season?: string;
  imageUrl?: string;
  tags?: string[];
  isFavorite?: boolean;
  isFrequent?: boolean;
}

export interface UploadedFile {
  fileName: string;
  newFileName: string;
  url: string;
}

export interface OutfitRecommendation {
  id?: string;
  outfitId?: string;
  title: string;
  scene?: string;
  reason?: string;
  score?: number;
  weather?: string;
  previewImageUrl?: string;
  pieces?: string[];
  colors?: string[];
  isSaved?: boolean;
}

export interface ExploreFeed {
  challenges?: Array<{ challengeId?: string; title: string; theme?: string; coverUrl?: string }>;
  hotOutfits?: OutfitRecommendation[];
}
