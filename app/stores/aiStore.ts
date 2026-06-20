import { create } from 'zustand';
import { generateOutfit as generateOutfitApi, generateVirtualTryOn as generateVirtualTryOnApi } from '@/services/ai';
import type { OutfitGenerationParams, OutfitRecommendation } from '@/types/outfit';

export interface AIState {
  isGenerating: boolean;
  loading: boolean;
  generatedImage: string | null;
  error: string | null;
  generateOutfit: (params: OutfitGenerationParams) => Promise<OutfitRecommendation>;
  generateVirtualTryOn: (bodyImageUrl: string, clothingIds: string[]) => Promise<{ imageUrl: string; success: boolean }>;
  clearGenerated: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  isGenerating: false,
  loading: false,
  generatedImage: null,
  error: null,
  generateOutfit: async (params) => {
    set({ isGenerating: true, loading: true, error: null });
    try {
      const result = await generateOutfitApi(params);
      set({ isGenerating: false, loading: false });
      return result;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '生成失败', isGenerating: false, loading: false });
      throw err;
    }
  },
  generateVirtualTryOn: async (bodyImageUrl, clothingIds) =>
    generateVirtualTryOnApi({
      bodyImageUrl,
      clothingImageUrl: clothingIds[0] || '',
      clothingType: 'mixed',
    }),
  clearGenerated: () => set({ generatedImage: null, error: null }),
}));
