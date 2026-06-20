import { create } from 'zustand';
import type { OutfitGenerationParams, OutfitRecommendation } from '@/types/outfit';
import { generateOutfits as generateOutfitsApi, getOutfitHistory, deleteOutfit as deleteOutfitApi } from '@/services/outfit';

interface OutfitState {
  currentOutfit: OutfitRecommendation | null;
  outfits: OutfitRecommendation[];
  loading: boolean;
  error: string | null;
  setCurrentOutfit: (outfit: OutfitRecommendation | null) => void;
  generateOutfits: (params?: OutfitGenerationParams | string, weather?: any) => Promise<OutfitRecommendation[]>;
  fetchOutfitHistory: (_userId?: string) => Promise<void>;
  deleteOutfit: (id: string, userId?: string) => Promise<void>;
}

export const useOutfitStore = create<OutfitState>((set) => ({
  currentOutfit: null,
  outfits: [],
  loading: false,
  error: null,
  setCurrentOutfit: (outfit) => set({ currentOutfit: outfit }),
  generateOutfits: async (params = {}, weather) => {
    set({ loading: true, error: null });
    try {
      const normalized = typeof params === 'string' ? { weather } : params;
      const outfits = await generateOutfitsApi(normalized);
      set({ outfits, loading: false });
      return outfits;
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : '生成搭配失败' });
      throw error;
    }
  },
  fetchOutfitHistory: async () => {
    set({ loading: true, error: null });
    try {
      set({ outfits: await getOutfitHistory(), loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : '获取搭配历史失败' });
    }
  },
  deleteOutfit: async (id, userId) => {
    await deleteOutfitApi(id, userId);
    set((state) => ({ outfits: state.outfits.filter((item) => item.id !== id) }));
  },
}));
