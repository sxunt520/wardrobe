import { useEffect, useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Image, Input, Picker, Text, View } from '@tarojs/components';
import { getToken } from '@/services/api';
import { deleteOutfit, generateOutfits, getOutfitHistory } from '@/services/wardrobe';
import type { OutfitRecommendation } from '@/types';
import './index.scss';

const scenes = ['通勤', '约会', '运动', '居家', '出差', '婚礼', '周末'];

export default function OutfitsPage() {
  const [scene, setScene] = useState('通勤');
  const [weather, setWeather] = useState('多云');
  const [temperature, setTemperature] = useState('23');
  const [history, setHistory] = useState<OutfitRecommendation[]>([]);
  const [generated, setGenerated] = useState<OutfitRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!getToken()) {
      setHistory([]);
      return;
    }
    try {
      setHistory(await getOutfitHistory());
    } catch (error) {
      Taro.showToast({ title: error instanceof Error ? error.message : '历史加载失败', icon: 'none' });
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useDidShow(() => {
    loadHistory();
  });

  const generate = async () => {
    if (!getToken()) {
      Taro.navigateTo({ url: '/pages/login/index' });
      return;
    }
    try {
      setLoading(true);
      Taro.showLoading({ title: '生成中' });
      const outfits = await generateOutfits({ scene, weather, temperature: Number(temperature) || 23 });
      setGenerated(outfits);
      setHistory([...outfits, ...history]);
      Taro.showToast({ title: '生成成功', icon: 'success' });
    } catch (error) {
      Taro.showToast({ title: error instanceof Error ? error.message : '生成失败', icon: 'none' });
    } finally {
      Taro.hideLoading();
      setLoading(false);
    }
  };

  const remove = async (item: OutfitRecommendation) => {
    const id = item.id || item.outfitId;
    if (!id) return;
    const confirm = await Taro.showModal({ title: '删除搭配', content: `确定删除「${item.title}」吗？` });
    if (!confirm.confirm) return;
    await deleteOutfit(id);
    setHistory((list) => list.filter((current) => (current.id || current.outfitId) !== id));
    setGenerated((list) => list.filter((current) => (current.id || current.outfitId) !== id));
    Taro.showToast({ title: '已删除', icon: 'success' });
  };

  const list = generated.length ? generated : history;

  if (!getToken()) {
    return (
      <View className="page">
        <View className="empty guest">
          <Text>登录并上传衣物后，就能生成今日穿搭。</Text>
          <Button className="btn guest-btn" onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}>去登录</Button>
        </View>
      </View>
    );
  }

  return (
    <View className="page">
      <View className="card generator">
        <Text className="generator-title">生成今日穿搭</Text>
        <View className="grid">
          <View className="field">
            <Text className="field-label">场景</Text>
            <Picker mode="selector" range={scenes} value={Math.max(scenes.indexOf(scene), 0)} onChange={(e) => setScene(scenes[Number(e.detail.value)])}>
              <View className="picker-value row between">{scene}<Text>›</Text></View>
            </Picker>
          </View>
          <View className="field">
            <Text className="field-label">温度</Text>
            <Input className="input" type="number" value={temperature} onInput={(e) => setTemperature(e.detail.value)} />
          </View>
        </View>
        <View className="field">
          <Text className="field-label">天气</Text>
          <Input className="input" value={weather} placeholder="多云/小雨/晴" onInput={(e) => setWeather(e.detail.value)} />
        </View>
        <Button className="btn" loading={loading} disabled={loading} onClick={generate}>生成 3 套搭配</Button>
      </View>

      <Text className="section-title">{generated.length ? '本次推荐' : '搭配历史'}</Text>
      {list.length ? (
        list.map((item) => (
          <View className="outfit-card" key={item.id || item.outfitId || item.title}>
            {item.previewImageUrl ? <Image className="outfit-preview" src={item.previewImageUrl} mode="aspectFill" /> : null}
            <View className="outfit-content">
              <View className="row between">
                <Text className="outfit-title">{item.title}</Text>
                <Text className="score">{item.score ? `${item.score}分` : ''}</Text>
              </View>
              <Text className="outfit-meta">{[item.scene, item.weather].filter(Boolean).join(' · ')}</Text>
              <Text className="outfit-reason">{item.reason}</Text>
              {item.pieces?.length ? <Text className="pieces">{item.pieces.join(' / ')}</Text> : null}
              <Button className="delete-btn" onClick={() => remove(item)}>删除</Button>
            </View>
          </View>
        ))
      ) : (
        <View className="empty">还没有搭配历史，先生成一组吧。</View>
      )}
    </View>
  );
}
