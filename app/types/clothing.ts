export interface ClothingItem {
  id: string;
  userId?: string;
  name: string;
  category: string;
  imageUrl?: string;
  localImageUri?: string;
  color?: string;
  colors?: string[];
  texture?: string;
  material?: string;
  season?: string;
  size?: string;
  brand?: string;
  notes?: string;
  tags?: string[];
  isFavorite?: boolean;
  isFrequent?: boolean;
  confidence?: number;
  manualEdit?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClothingFilterOptions {
  category?: string;
  color?: string;
  season?: string;
  isFrequent?: boolean;
}
