import { create } from 'zustand';

export const useExploreStore = create((set) => ({
  challenges: [],
  popularOutfits: [],
  isLoading: false,
}));
