import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { OutfitCard } from '@/components/outfit/OutfitCard';
import { getClothingItems } from '@/services/clothing';
import { generateOutfits } from '@/services/outfit';
import { useLocation } from '@/hooks/useLocation';
import { useWeather } from '@/hooks/useWeather';
import type { ClothingItem } from '@/types/clothing';
import type { OutfitRecommendation } from '@/types/outfit';

const scenes = ['通勤', '约会', '运动', '居家', '出差'];

export default function OutfitGeneratorScreen() {
  const router = useRouter();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scene, setScene] = useState('通勤');
  const [outfits, setOutfits] = useState<OutfitRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { location } = useLocation();
  const { weather } = useWeather(location);

  useEffect(() => {
    getClothingItems().then(setItems).catch(() => setItems([]));
  }, []);

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      setOutfits(await generateOutfits({
        scene,
        weather: weather || '多云',
        temperature: weather?.temperature || 23,
        clothingIds: selectedIds,
      }));
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : '生成搭配失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>生成今日搭配</Text>
      <Text style={styles.subtitle}>AI 会选择完整单品并合成一张真实衣物平铺效果图</Text>
      <Text style={styles.weather}>{location?.city || '当前位置'} · {weather ? `${weather.temperature}℃ ${weather.condition}` : '天气获取中'}</Text>
      <View style={styles.options}>
        {scenes.map((value) => (
          <TouchableOpacity key={value} style={[styles.option, scene === value && styles.active]} onPress={() => setScene(value)}>
            <Text style={scene === value ? styles.activeText : styles.optionText}>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>指定衣物（可选）</Text>
      {!items.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>衣橱为空，请先录入衣物。</Text>
          <Button onPress={() => router.push('/wardrobe/add-clothing')}>添加衣物</Button>
        </View>
      ) : null}
      <View style={styles.items}>
        {items.map((item) => {
          const selected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity key={item.id} style={[styles.item, selected && styles.selected]} onPress={() => setSelectedIds((current) => selected ? current.filter((id) => id !== item.id) : [...current, item.id])}>
              {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.itemImage} /> : null}
              <View style={styles.itemText}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.category}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button onPress={generate} loading={loading} disabled={!items.length}>
        {loading ? 'AI 正在搭配并合成效果图...' : '生成搭配效果图'}
      </Button>
      {loading ? <Text style={styles.loadingHint}>通常需要 10-30 秒，请保持页面开启</Text> : null}
      <View style={styles.results}>
        {outfits.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} onPress={() => router.push(`/outfits/${outfit.id}` as any)} />)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f5' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#666', marginBottom: 20 },
  weather: { color: '#A56D4D', fontWeight: '700', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '600', marginVertical: 14 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 8 },
  active: { backgroundColor: '#181818' },
  optionText: { color: '#333' },
  activeText: { color: '#fff' },
  items: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  item: { width: '48%', minHeight: 82, padding: 8, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: 'transparent', flexDirection: 'row', gap: 9 },
  selected: { borderColor: '#181818' },
  itemImage: { width: 58, height: 66, borderRadius: 6, backgroundColor: '#EEE8DF' },
  itemText: { flex: 1, justifyContent: 'center' },
  itemName: { fontWeight: '700', fontSize: 12 },
  itemMeta: { color: '#777', marginTop: 4 },
  results: { marginTop: 20 },
  error: { color: '#9D2C22', backgroundColor: '#FDECEA', padding: 12, borderRadius: 8, marginBottom: 12 },
  loadingHint: { color: '#756A60', fontSize: 12, textAlign: 'center', marginTop: 9 },
  empty: { backgroundColor: '#fff', borderRadius: 8, padding: 16, gap: 12, marginBottom: 16 },
  emptyText: { color: '#666' },
});
