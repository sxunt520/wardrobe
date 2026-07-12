import { useEffect, useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Image, ScrollView, Text, View } from '@tarojs/components';
import { getToken } from '@/services/api';
import { deleteClothing, getClothingItems } from '@/services/wardrobe';
import type { ClothingItem } from '@/types';
import './index.scss';

const categories = ['全部', '上衣', '裤装', '裙装', '外套', '鞋包', '配饰'];

export default function WardrobePage() {
  const [category, setCategory] = useState('全部');
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async (nextCategory = category) => {
    if (!getToken()) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      setItems(await getClothingItems(nextCategory));
    } catch (error) {
      Taro.showToast({ title: error instanceof Error ? error.message : '衣橱加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useDidShow(() => {
    load();
  });

  const remove = async (item: ClothingItem) => {
    const id = item.id || item.clothingId;
    if (!id) return;
    const confirm = await Taro.showModal({ title: '删除衣物', content: `确定删除「${item.name}」吗？` });
    if (!confirm.confirm) return;
    await deleteClothing(id);
    Taro.showToast({ title: '已删除', icon: 'success' });
    load();
  };

  if (!getToken()) {
    return (
      <View className="page">
        <View className="empty guest">
          <Text>登录后可以查看你的数字衣橱。</Text>
          <Button className="btn guest-btn" onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}>去登录</Button>
        </View>
      </View>
    );
  }

  return (
    <View className="page">
      <ScrollView className="tabs" scrollX>
        {categories.map((item) => (
          <View
            key={item}
            className={`tab ${item === category ? 'active' : ''}`}
            onClick={() => {
              setCategory(item);
              load(item);
            }}
          >
            {item}
          </View>
        ))}
      </ScrollView>

      {items.length ? (
        <View className="clothing-grid">
          {items.map((item) => (
            <View className="clothing-card" key={item.id || item.clothingId}>
              {item.imageUrl ? <Image className="clothing-image" src={item.imageUrl} mode="aspectFill" /> : <View className="image-placeholder" />}
              <View className="clothing-info">
                <Text className="clothing-name">{item.name}</Text>
                <Text className="clothing-meta">{[item.category, item.color, item.season].filter(Boolean).join(' · ')}</Text>
                <Button className="delete-btn" onClick={() => remove(item)}>删除</Button>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="empty">{loading ? '正在加载衣橱...' : '还没有衣物，先上传第一件吧。'}</View>
      )}

      <Button className="btn floating" onClick={() => Taro.switchTab({ url: '/pages/upload/index' })}>上传衣物</Button>
    </View>
  );
}
