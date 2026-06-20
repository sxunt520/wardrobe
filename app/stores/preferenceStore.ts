import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BodyType, StylePreference, ColorPreference } from '@/types/user';

interface PreferenceState {
  bodyType: BodyType | null;
  stylePreferences: StylePreference[];
  colorPreferences: ColorPreference;
  notificationSettings: {
    weatherReminders: boolean;
    outfitSuggestions: boolean;
    challengeNotifications: boolean;
  };
  setBodyType: (bodyType: BodyType) => void;
  setStylePreferences: (styles: StylePreference[]) => void;
  setColorPreferences: (colors: ColorPreference) => void;
  setNotificationSettings: (settings: any) => void;
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      bodyType: null,
      stylePreferences: [],
      colorPreferences: {
        favoriteColors: [],
        avoidColors: [],
      },
      notificationSettings: {
        weatherReminders: true,
        outfitSuggestions: true,
        challengeNotifications: true,
      },
      setBodyType: (bodyType) => set({ bodyType }),
      setStylePreferences: (stylePreferences) => set({ stylePreferences }),
      setColorPreferences: (colorPreferences) => set({ colorPreferences }),
      setNotificationSettings: (notificationSettings) => set({ notificationSettings }),
    }),
    {
      name: 'preference-storage',
    }
  )
);