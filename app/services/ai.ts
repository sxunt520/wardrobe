import api, { unwrapData } from './api';
import { isRemoteImageUrl, uploadImage } from './upload';
import type { OutfitGenerationParams, OutfitRecommendation } from '@/types/outfit';

export const analyzeImageWithAI = async (imageUri: string) => {
  const imageUrl = isRemoteImageUrl(imageUri) ? imageUri : (await uploadImage(imageUri)).url;
  const response = await api.post('/app/wardrobe/ai/analyze-clothing', {
    imageUrl,
  });
  const data = unwrapData<any>(response);
  return {
    ...data,
    material: data.texture,
    suggestedName: data.name,
  };
};

export const analyzeImage = analyzeImageWithAI;

export const generateOutfit = async (params: OutfitGenerationParams | any): Promise<OutfitRecommendation> => {
    const response = await api.post('/app/wardrobe/outfits/generate', {
    scene: params.scene || params.occasion || '通勤',
    weather: params.weather?.condition || params.weather || '多云',
    temperature: params.weather?.temperature || params.temperature || 23,
    clothingIds: params.clothingItemIds || params.clothingIds || [],
  });
  const outfits = unwrapData<any[]>(response);
  const first = outfits[0];
  return {
    id: first.id || first.outfitId,
    name: first.title,
    title: first.title,
    scene: first.scene,
    items: first.pieces || [],
    pieces: first.pieces || [],
    colors: first.colors || [],
    score: first.score,
    description: first.reason,
    reason: first.reason,
  } as any;
};

export const uploadImageForVirtualTryOn = async (imageUri: string, clothingId?: string) => {
  console.log('Virtual try-on:', imageUri, clothingId);
  return { resultImage: 'https://via.placeholder.com/500', success: true };
};

export const generateVirtualTryOn = async ({
  bodyImageUrl,
  clothingImageUrl,
  clothingType,
}: {
  bodyImageUrl: string;
  clothingImageUrl: string;
  clothingType?: string;
}) => {
  return {
    imageUrl: bodyImageUrl || clothingImageUrl,
    clothingType,
    success: true,
  };
};
