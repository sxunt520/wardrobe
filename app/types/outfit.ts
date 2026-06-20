import type { ClothingItem } from './clothing';

export interface OutfitRecommendation {
  id: string;
  name?: string;
  title?: string;
  scene?: string;
  items?: ClothingItem[] | string[];
  clothingIds?: string[];
  pieces?: string[];
  colors?: string[];
  score?: number;
  reason?: string;
  description?: string;
  weather?: WeatherInfo | string;
  occasion?: string;
  confidence?: number;
  imageUrl?: string;
  previewImageUrl?: string;
  renderStatus?: 'pending' | 'processing' | 'succeeded' | 'failed';
  renderError?: string;
  tryOnPersonUrl?: string;
  tryOnImageUrl?: string;
  tryOnTaskId?: string;
  tryOnRecordId?: string;
  tryOnStatus?: 'idle' | 'submitting' | 'processing' | 'succeeded' | 'failed';
  tryOnError?: string;
  createdAt?: string;
  isSaved?: boolean;
}

export interface TryOnHistoryRecord {
  id: string;
  outfitId: string;
  outfitTitle: string;
  scene: string;
  clothingIds: string[];
  personImageUrl: string;
  topGarmentUrl?: string;
  bottomGarmentUrl?: string;
  resultImageUrl?: string;
  taskId?: string;
  status: 'submitting' | 'processing' | 'succeeded' | 'failed';
  errorMessage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OutfitGenerationParams {
  scene?: string;
  occasion?: string;
  weather?: WeatherInfo | string;
  temperature?: number;
  clothingIds?: string[];
  clothingItemIds?: string[];
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  icon?: string;
}
