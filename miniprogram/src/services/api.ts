import Taro from '@tarojs/taro';
import type { ApiResponse } from '@/types';

export const API_BASE_URL = process.env.TARO_APP_API_BASE_URL || 'http://139.155.127.129/wardrobe-api';
export const TOKEN_KEY = 'wardrobe_auth_token';
export const USER_KEY = 'wardrobe_user';

export const getToken = () => Taro.getStorageSync<string>(TOKEN_KEY);

export const setToken = (token: string) => Taro.setStorageSync(TOKEN_KEY, token);

export const clearAuth = () => {
  Taro.removeStorageSync(TOKEN_KEY);
  Taro.removeStorageSync(USER_KEY);
};

export function normalizeMediaUrl(url?: string) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
}

export async function request<T>(options: Taro.request.Option): Promise<T> {
  const token = getToken();
  const header = {
    'Content-Type': 'application/json',
    ...(options.header || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await Taro.request<ApiResponse<T>>({
    timeout: 30000,
    ...options,
    url: `${API_BASE_URL}${options.url}`,
    header,
  });

  if (response.statusCode === 401) {
    clearAuth();
    throw new Error('登录已过期，请重新登录');
  }
  const body = response.data;
  if (body?.code && body.code !== 200) {
    throw new Error(body.message || body.msg || '请求失败');
  }
  return (body?.data !== undefined ? body.data : body) as T;
}
