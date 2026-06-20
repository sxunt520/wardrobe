import { useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { login as authLogin, signup as authSignup, logout as authLogout } from '@/services/auth';
import type { LoginCredentials, SignupCredentials } from '@/services/auth';

export const useAuth = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authLogin(credentials);
      await setUser(userData);
      return userData;
    } catch (err) {
      setError('登录失败，请检查邮箱和密码');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    setLoading(true);
    setError(null);
    try {
      await authSignup(credentials);
    } catch (err) {
      setError('注册失败，请检查信息是否正确');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authLogout();
      await setUser(null);
    } catch (err) {
      console.error('登出失败:', err);
    }
  }, [setUser]);

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
  };
};
