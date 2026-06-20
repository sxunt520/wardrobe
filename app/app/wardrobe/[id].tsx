import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { deleteClothingItem, getClothingItems, updateClothingItem } from '@/services/clothing';
import { useWardrobeStore } from '@/stores/wardrobeStore';
import type { ClothingItem } from '@/types/clothing';

export default function ClothingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const storeItems = useWardrobeStore((state) => state.clothingItems);
  const removeFromStore = useWardrobeStore((state) => state.deleteClothingItem);
  const updateStore = useWardrobeStore((state) => state.updateClothingItem);
  const [item, setItem] = useState<ClothingItem | null>(storeItems.find((entry) => entry.id === id) || null);
  const [loading, setLoading] = useState(!item);

  useEffect(() => {
    if (item || !id) return;
    getClothingItems()
      .then((items) => setItem(items.find((entry) => entry.id === id) || null))
      .finally(() => setLoading(false));
  }, [id, item]);

  const toggleFrequent = async () => {
    if (!item) return;
    const updated = await updateClothingItem(item.id, { isFrequent: !item.isFrequent });
    setItem(updated);
    updateStore(updated);
  };

  const remove = () => {
    if (!item) return;
    Alert.alert('删除衣物', '确认删除这件衣物吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteClothingItem(item.id);
          removeFromStore(item.id);
          router.back();
        },
      },
    ]);
  };

  if (loading) return <View style={styles.center}><Text>正在加载...</Text></View>;
  if (!item) return <View style={styles.center}><Text>未找到该衣物</Text></View>;

  return (
    <ScrollView style={styles.container}>
      {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} /> : <View style={styles.placeholder}><Text>{item.category}</Text></View>}
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <View style={styles.info}>
          <Text>颜色：{item.color || '未填写'}</Text>
          <Text>材质：{item.texture || item.material || '未填写'}</Text>
          <Text>季节：{item.season || '四季'}</Text>
          <Text>品牌：{item.brand || '未填写'}</Text>
          <Text>识别置信度：{item.confidence ? `${item.confidence}%` : '手动录入'}</Text>
        </View>
        <View style={styles.actions}>
          <Button onPress={toggleFrequent} variant="secondary">{item.isFrequent ? '取消常穿' : '设为常穿'}</Button>
          <Button onPress={remove} variant="danger">删除衣物</Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 360, resizeMode: 'cover' },
  placeholder: { height: 300, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8e8e4' },
  content: { padding: 20, gap: 8 },
  name: { fontSize: 26, fontWeight: '700' },
  category: { color: '#666', fontSize: 16 },
  info: { marginVertical: 16, padding: 16, backgroundColor: '#fff', borderRadius: 8, gap: 12 },
  actions: { gap: 12 },
});
