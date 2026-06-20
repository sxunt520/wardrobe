import api from './api';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils/storage';
import type { CaptchaInfo, User } from '@/types/user';
import { unwrapData } from './api';

export interface LoginCredentials {
  userName: string;
  password: string;
  code?: string;
  uuid?: string;
}

export interface SignupCredentials {
  userName: string;
  password: string;
  nickname: string;
  email?: string;
}

const assertSuccess = (response: any) => {
  if (response?.data?.code !== 200) {
    throw new Error(response?.data?.msg || '请求失败');
  }
};

export const getCaptcha = async (): Promise<CaptchaInfo> => {
  const response = await api.get('/captchaImage');
  assertSuccess(response);
  return unwrapData<CaptchaInfo>(response);
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/getInfo');
  assertSuccess(response);
  const data = response.data;
  const raw = data.user;
  return {
    id: String(raw.userId),
    userId: raw.userId,
    userName: raw.userName,
    nickName: raw.nickName || raw.userName,
    email: raw.email,
    avatar: raw.avatar,
    deptName: raw.deptName,
    roles: data.roles || [],
    permissions: data.permissions || [],
  };
};

export const login = async (credentials: LoginCredentials): Promise<User> => {
  const response = await api.post('/login', credentials);
  assertSuccess(response);
  const token = response.data.data.token;
  await setStorageItem('auth_token', token);
  try {
    const user = await getCurrentUser();
    await setStorageItem('user', user);
    return user;
  } catch (error) {
    await removeStorageItem('auth_token');
    throw error;
  }
};

export const signup = async (credentials: SignupCredentials): Promise<void> => {
  const response = await api.post('/register', {
    userName: credentials.userName,
    password: credentials.password,
    nickName: credentials.nickname,
    email: credentials.email,
  });
  assertSuccess(response);
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/logout');
  } catch (error) {
    console.error('登出失败:', error);
  } finally {
    // 清除本地存储
    await removeStorageItem('auth_token');
    await removeStorageItem('user');
  }
};

export const checkAuth = async (): Promise<User | null> => {
  try {
    const token = await getStorageItem('auth_token');
    const userData = await getStorageItem('user');
    
    if (token && userData) {
      return userData as User;
    }
    
    return null;
  } catch (error) {
    console.error('检查认证状态失败:', error);
    return null;
  }
};
