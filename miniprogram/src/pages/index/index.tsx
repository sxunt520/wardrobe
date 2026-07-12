import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { Button, Image, Text, View } from '@tarojs/components';
import { getToken } from '@/services/api';
import { getExploreFeed, getOutfitHistory } from '@/services/wardrobe';
import type { ExploreFeed, OutfitRecommendation } from '@/types';
import './index.scss';

export default function IndexPage() {
  const [authed, setAuthed] = useState(false);
  const [feed, setFeed] = useState<ExploreFeed>({});
  const [recent, setRecent] = useState<OutfitRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Boolean(getToken());
    setAuthed(token);
    Promise.all([getExploreFeed(), token ? getOutfitHistory().catch(() => []) : Promise.resolve([])])
      .then(([nextFeed, nextRecent]) => {
        setFeed(nextFeed || {});
        setRecent(nextRecent.slice(0, 2));
      })
      .catch((error) => Taro.showToast({ title: error instanceof Error ? error.message : '首页加载失败', icon: 'none' }))
      .finally(() => setLoading(false));
  }, []);

  const requireLogin = (url: string) => {
    if (!getToken()) {
      Taro.navigateTo({ url: '/pages/login/index' });
      return;
    }
    Taro.switchTab({ url });
  };

  return (
    <View className="page">
      <View className="hero index-hero">
        <Text className="hero-title">今天穿什么，一眼就有答案</Text>
        <Text className="hero-subtitle">上传真实衣物后，AI 会按天气和场景生成每日搭配。</Text>
        <View className="hero-actions">
          <Button className="btn light" onClick={() => requireLogin('/pages/upload/index')}>上传衣物</Button>
          <Button className="btn outline" onClick={() => requireLogin('/pages/outfits/index')}>生成搭配</Button>
        </View>
      </View>

      <View className="quick-grid">
        <View className="quick-card" onClick={() => requireLogin('/pages/upload/index')}>
          <Text className="quick-num">01</Text>
          <Text className="quick-title">拍照识别</Text>
          <Text className="quick-desc">先上传到 COS，再进行 AI 识别。</Text>
        </View>
        <View className="quick-card" onClick={() => requireLogin('/pages/wardrobe/index')}>
          <Text className="quick-num">02</Text>
          <Text className="quick-title">衣橱管理</Text>
          <Text className="quick-desc">按类别查看已保存单品。</Text>
        </View>
      </View>

      <Text className="section-title">最近搭配</Text>
      {authed && recent.length ? (
        recent.map((item) => (
          <View className="outfit-card" key={item.id || item.outfitId}>
            {item.previewImageUrl ? <Image className="outfit-image" src={item.previewImageUrl} mode="aspectFill" /> : null}
            <View className="outfit-body">
              <Text className="outfit-title">{item.title}</Text>
              <Text className="outfit-reason">{item.reason || item.weather}</Text>
            </View>
          </View>
        ))
      ) : (
        <View className="empty">{loading ? '正在加载...' : authed ? '还没有搭配历史，去生成第一套吧。' : '登录后会展示你的最近搭配。'}</View>
      )}

      <Text className="section-title">灵感挑战</Text>
      <View className="challenge-list">
        {(feed.challenges || []).slice(0, 3).map((item, index) => (
          <View className="challenge" key={item.challengeId || item.title}>
            <Text className="challenge-index">#{index + 1}</Text>
            <Text className="challenge-title">{item.title || item.theme}</Text>
          </View>
        ))}
        {!feed.challenges?.length ? <View className="empty">暂无挑战主题</View> : null}
      </View>
    </View>
  );
}
