import { create } from 'zustand';
import type { ClothingItem, ClothingFilterOptions } from '@/types/clothing';

interface WardrobeState {
  clothingItems: ClothingItem[];
  items: ClothingItem[];
  loading: boolean;
  isLoading: boolean;
  filters: ClothingFilterOptions & { sortBy?: string };
  setItems: (items: ClothingItem[]) => void;
  addItem: (item: ClothingItem) => void;
  addClothingItem: (item: ClothingItem) => void;
  removeItem: (id: string) => void;
  deleteClothingItem: (id: string) => void;
  updateClothingItem: (item: ClothingItem) => void;
  setFilters: (filters: ClothingFilterOptions) => void;
}

export const useWardrobeStore = create<WardrobeState>((set) => ({
  clothingItems: [],
  items: [],
  loading: false,
  isLoading: false,
  filters: { sortBy: 'recent' },
  setItems: (items) => set({ clothingItems: items, items }),
  addItem: (item) => set((state) => ({ 
    clothingItems: [...state.clothingItems, item],
    items: [...state.items, item]
  })),
  addClothingItem: (item) => set((state) => ({
    clothingItems: [...state.clothingItems, item],
    items: [...state.items, item],
  })),
  removeItem: (id) => set((state) => ({ 
    clothingItems: state.clothingItems.filter(i => i.id !== id),
    items: state.items.filter(i => i.id !== id)
  })),
  deleteClothingItem: (id) => set((state) => ({
    clothingItems: state.clothingItems.filter((item) => item.id !== id),
    items: state.items.filter((item) => item.id !== id),
  })),
  updateClothingItem: (updated) => set((state) => ({
    clothingItems: state.clothingItems.map((item) => item.id === updated.id ? updated : item),
    items: state.items.map((item) => item.id === updated.id ? updated : item),
  })),
  setFilters: (filters) => set({ filters }),
}));
