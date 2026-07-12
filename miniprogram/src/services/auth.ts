import Taro from '@tarojs/taro';
import { clearAuth, request, setToken, USER_KEY } from './api';
import type { UserInfo } from '@/types';

export interface WechatLoginResult {
  token: string;
  user: UserInfo;
}

export async function loginWithWechat() {
  const loginResult = await Taro.login();
  if (!loginResult.code) throw new Error('微信登录失败，请重试');
  const data = await request<WechatLoginResult>({
    url: '/app/auth/wechat-login',
    method: 'POST',
    data: {
      code: loginResult.code,
    },
  });
  setToken(data.token);
  Taro.setStorageSync(USER_KEY, data.user);
  return data.user;
}

export function getStoredUser() {
  return Taro.getStorageSync<UserInfo>(USER_KEY) || null;
}

export function logout() {
  clearAuth();
}
