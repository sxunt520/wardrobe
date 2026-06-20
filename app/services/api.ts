import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getStorageItem, removeStorageItem } from '@/utils/storage';

const expoHost = Constants.expoConfig?.hostUri
  ?.replace(/^https?:\/\//, '')
  .replace(/:\d+$/, '');
const defaultHost = Platform.OS === 'web' ? 'localhost' : expoHost || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || `http://${defaultHost}:8080`;

export const normalizeMediaUrl = (url?: string) => {
  if (!url) return '';
  try {
    const mediaUrl = new URL(url);
    const apiUrl = new URL(API_BASE_URL);
    if (mediaUrl.hostname === 'localhost' || mediaUrl.hostname === '127.0.0.1') {
      mediaUrl.protocol = apiUrl.protocol;
      mediaUrl.hostname = apiUrl.hostname;
      mediaUrl.port = apiUrl.port;
    }
    return mediaUrl.toString();
  } catch {
    return url;
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getStorageItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    if (typeof (config.headers as any).delete === 'function') {
      (config.headers as any).delete('Content-Type');
    } else {
      delete (config.headers as any)['Content-Type'];
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data?.code && response.data.code !== 200) {
      const message = response.data?.message || response.data?.msg || '请求失败';
      const requestError = new Error(Array.isArray(message) ? message.join('；') : message);
      (requestError as any).status = response.data.code;
      return Promise.reject(requestError);
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await removeStorageItem('auth_token');
      await removeStorageItem('user');
    }
    const message = error.response?.data?.message || error.response?.data?.msg;
    if (message) {
      const requestError = new Error(Array.isArray(message) ? message.join('；') : message);
      (requestError as any).status = error.response?.status;
      return Promise.reject(requestError);
    }
    return Promise.reject(error);
  }
);

export const unwrapData = <T>(response: any): T => {
  if (response?.data?.data !== undefined) return response.data.data as T;
  return response?.data as T;
};

export default api;
