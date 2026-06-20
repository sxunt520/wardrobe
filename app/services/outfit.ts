import api, { unwrapData } from './api';
import { OutfitRecommendation, OutfitGenerationParams, TryOnHistoryRecord } from '@/types/outfit';

export const generateOutfits = async (params: OutfitGenerationParams | any): Promise<OutfitRecommendation[]> => {
  try {
    const response = await api.post('/app/wardrobe/outfits/generate', {
        scene: params.scene || params.occasion || '通勤',
        weather: params.weather?.condition || params.weather || '多云',
        temperature: params.weather?.temperature || params.temperature || 23,
        clothingIds: params.clothingItemIds || params.clothingIds || [],
      },
      { timeout: 90000 },
    );
    return unwrapData<OutfitRecommendation[]>(response);
  } catch (error) {
    console.error('生成搭配失败:', error);
    throw new Error('生成搭配失败');
  }
};

export const generateOutfit = async (params: OutfitGenerationParams): Promise<OutfitRecommendation> => {
  const outfits = await generateOutfits(params);
  return outfits[0];
};

export const getOutfitHistory = async (): Promise<OutfitRecommendation[]> => {
  try {
    const response = await api.get('/app/wardrobe/outfits/history');
    return unwrapData<OutfitRecommendation[]>(response);
  } catch (error) {
    console.error('获取搭配历史失败:', error);
    throw new Error('获取搭配历史失败');
  }
};

export const saveOutfit = async (outfit: OutfitRecommendation): Promise<OutfitRecommendation> => {
  const response = await api.patch(`/app/wardrobe/outfits/${outfit.id}/save`, {
    isSaved: !outfit.isSaved,
  });
  return unwrapData<OutfitRecommendation>(response);
};

export const deleteOutfit = async (outfitId: string, _userId?: string): Promise<void> => {
  await api.delete(`/app/wardrobe/outfits/${outfitId}`);
};

export const getOutfitById = async (outfitId: string): Promise<OutfitRecommendation> => {
  const response = await api.get(`/app/wardrobe/outfits/${outfitId}`);
  return unwrapData<OutfitRecommendation>(response);
};

export const renderOutfitPreview = async (outfitId: string): Promise<OutfitRecommendation> => {
  const response = await api.post(`/app/wardrobe/outfits/${outfitId}/render`, undefined, { timeout: 90000 });
  return unwrapData<OutfitRecommendation>(response);
};

export const startTryOn = async (outfitId: string, personImageUrl: string): Promise<OutfitRecommendation> => {
  const response = await api.post(`/app/wardrobe/outfits/${outfitId}/try-on`, { personImageUrl }, { timeout: 45000 });
  return unwrapData<OutfitRecommendation>(response);
};

export const getTryOnStatus = async (outfitId: string): Promise<OutfitRecommendation> => {
  const response = await api.get(`/app/wardrobe/outfits/${outfitId}/try-on`, { timeout: 45000 });
  return unwrapData<OutfitRecommendation>(response);
};

export const getTryOnHistory = async (): Promise<TryOnHistoryRecord[]> => {
  const response = await api.get('/app/wardrobe/try-on/history');
  return unwrapData<TryOnHistoryRecord[]>(response);
};

export const getTryOnHistoryById = async (recordId: string): Promise<TryOnHistoryRecord> => {
  const response = await api.get(`/app/wardrobe/try-on/history/${recordId}`);
  return unwrapData<TryOnHistoryRecord>(response);
};

export const deleteTryOnHistory = async (recordId: string): Promise<void> => {
  await api.delete(`/app/wardrobe/try-on/history/${recordId}`);
};
