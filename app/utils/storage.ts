import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const hasLocalStorage = () =>
  Platform.OS === 'web' &&
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as any).localStorage !== 'undefined';

export const getStorageItem = async (key: string): Promise<any> => {
  const value = hasLocalStorage()
    ? (globalThis as any).localStorage.getItem(key)
    : await SecureStore.getItemAsync(key);
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return value;
  }
};

export const setStorageItem = async (key: string, value: any): Promise<void> => {
  const toStore = typeof value === 'string' ? value : JSON.stringify(value);
  if (hasLocalStorage()) {
    (globalThis as any).localStorage.setItem(key, toStore);
    return;
  }
  await SecureStore.setItemAsync(key, toStore);
};

export const removeStorageItem = async (key: string): Promise<void> => {
  if (hasLocalStorage()) {
    (globalThis as any).localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
};
