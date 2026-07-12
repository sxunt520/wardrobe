import { useState } from 'react';
import Taro from '@tarojs/taro';
import { Button, Text, View } from '@tarojs/components';
import { loginWithWechat } from '@/services/auth';
import './index.scss';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await loginWithWechat();
      Taro.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 350);
    } catch (error) {
      Taro.showToast({ title: error instanceof Error ? error.message : '登录失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="page login-page">
      <View className="login-panel">
        <Text className="brand">衣橱管家</Text>
        <Text className="title">用微信登录，开始整理你的每日穿搭</Text>
        <Text className="desc">登录后可以上传衣物、AI 识别、保存衣橱并生成搭配历史。</Text>
        <Button className="btn" loading={loading} disabled={loading} onClick={handleLogin}>
          微信一键登录
        </Button>
        <Button className="btn secondary ghost" onClick={() => Taro.switchTab({ url: '/pages/index/index' })}>
          先看看首页
        </Button>
      </View>
    </View>
  );
}
