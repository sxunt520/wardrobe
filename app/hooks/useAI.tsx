import { useState, useCallback } from 'react';
import { generateOutfit, analyzeImage } from '@/services/ai';
import { OutfitRecommendation, OutfitGenerationParams } from '@/types/outfit';
import { ImageAnalysisResult } from '@/types/ai';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateOutfitRecommendation = useCallback(async (params: OutfitGenerationParams): Promise<OutfitRecommendation> => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateOutfit(params);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成搭配失败';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeClothingImage = useCallback(async (imageUrl: string): Promise<ImageAnalysisResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeImage(imageUrl);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '图片分析失败';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generateOutfit: generateOutfitRecommendation,
    analyzeImage: analyzeClothingImage,
  };
};