import { useEffect, useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Text, View } from '@tarojs/components';
import { API_BASE_URL, getToken } from '@/services/api';
import { getStoredUser, loginWithWechat, logout } from '@/services/auth';
import { getClothingItems, getOutfitHistory } from '@/services/wardrobe';
import type { UserInfo } from '@/types';
import './index.scss';

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [clothingCount, setClothingCount] = useState(0);
  const [outfitCount, setOutfitCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const stored = getStoredUser();
    setUser(stored);
    if (!getToken()) return;
    try {
      const [clothing, outfits] = await Promise.all([getClothingItems(), getOutfitHistory()]);
      setClothingCount(clothing.length);
      setOutfitCount(outfits.length);
    } catch {
      // Keep profile usable even when one business API is temporarily unavailable.
    }
  };

  useEffect(() => {
    load();
  }, []);

  useDidShow(() => {
    load();
  });

  const handleLogin = async () => {
    try {
      setLoading(true);
      const nextUser = await loginWithWechat();
      setUser(nextUser);
      await load();
      Taro.showToast({ title: '登录成功', icon: 'success' });
    } catch (error) {
      Taro.showToast({ title: error instanceof Error ? error.message : '登录失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setClothingCount(0);
    setOutfitCount(0);
    Taro.showToast({ title: '已退出', icon: 'success' });
  };

  return (
    <View className="page">
      <View className="profile-hero">
        <Text className="profile-name">{user?.nickName || user?.userName || '未登录用户'}</Text>
        <Text className="profile-desc">{user ? '你的数字衣橱正在更新中' : '登录后同步你的衣橱和搭配历史'}</Text>
      </View>

      <View className="stat-grid">
        <View className="stat-card">
          <Text className="stat-num">{clothingCount}</Text>
          <Text className="stat-label">衣物</Text>
        </View>
        <View className="stat-card">
          <Text className="stat-num">{outfitCount}</Text>
          <Text className="stat-label">搭配</Text>
        </View>
      </View>

      <View className="card settings">
        <Text className="setting-label">接口地址</Text>
        <Text className="setting-value">{API_BASE_URL}</Text>
      </View>

      {user ? (
        <Button className="btn danger logout" onClick={handleLogout}>退出登录</Button>
      ) : (
        <Button className="btn logout" loading={loading} disabled={loading} onClick={handleLogin}>微信登录</Button>
      )}
    </View>
  );
}
