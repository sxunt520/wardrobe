import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { getClothingItems } from '@/services/clothing';
import { useAuthStore } from '@/stores/authStore';
import type { ClothingItem } from '@/types/clothing';

const filters = ['全部', '上衣', '裤装', '裙装', '外套', '鞋包', '配饰'];

export default function WardrobeScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeFilter, setActiveFilter] = useState('全部');
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setItems(await getClothingItems());
  }, []);

  useFocusEffect(useCallback(() => {
    if (isAuthenticated) load().catch(() => null);
    else setItems([]);
  }, [isAuthenticated, load]));

  const visibleItems = useMemo(
    () => activeFilter === '全部' ? items : items.filter((item) => item.category === activeFilter),
    [activeFilter, items],
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.guestPage}>
          <View style={styles.guestIcon}><Ionicons name="shirt-outline" size={38} color="#A56D4D" /></View>
          <Text style={styles.guestTitle}>建立你的数字衣橱</Text>
          <Text style={styles.guestCopy}>登录后拍照录入衣物，AI 会自动识别类别、颜色和季节，并为你生成每日搭配。</Text>
          <Pressable style={styles.guestButton} onPress={() => router.push('/(auth)/login')}>
            <Ionicons name="log-in-outline" size={19} color="#FFF8EF" />
            <Text style={styles.guestButtonText}>登录或注册</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)')}><Text style={styles.guestLink}>返回首页继续看看</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>DIGITAL CLOSET</Text>
            <Text style={styles.title}>我的衣橱</Text>
          </View>
          <Text style={styles.capacity}>{items.length} / 30</Text>
        </View>

        <Pressable style={styles.addPanel} onPress={() => router.push('/wardrobe/add-clothing')}>
          <View>
            <Text style={styles.addTitle}>录入一件衣物</Text>
            <Text style={styles.addCopy}>拍照或从相册选择，AI 自动识别并填写信息。</Text>
          </View>
          <View style={styles.addIcon}><Ionicons name="camera" size={22} color="#191815" /></View>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((filter) => (
            <Pressable key={filter} onPress={() => setActiveFilter(filter)} style={[styles.filter, activeFilter === filter && styles.filterActive]}>
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {visibleItems.length ? (
          <View style={styles.grid}>
            {visibleItems.map((item) => (
              <Pressable key={item.id} style={styles.card} onPress={() => router.push({ pathname: '/wardrobe/[id]', params: { id: item.id } })}>
                {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" /> : <View style={styles.placeholder}><Ionicons name="shirt-outline" size={34} color="#9A8C7E" /></View>}
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.category}>{item.category}</Text>
                    {item.isFavorite ? <Ionicons name="heart" size={15} color="#C45D4B" /> : null}
                  </View>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.meta}>{item.color || '未标颜色'} · {item.season || '四季'}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="camera-outline" size={34} color="#8B7969" />
            <Text style={styles.emptyTitle}>{items.length ? '这个分类还没有衣物' : '衣橱还是空的'}</Text>
            <Pressable onPress={() => router.push('/wardrobe/add-clothing')}><Text style={styles.emptyLink}>立即录入</Text></Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F1E8' },
  content: { padding: 20, paddingBottom: 110 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  eyebrow: { color: '#8B7969', fontSize: 11, fontWeight: '800' },
  title: { fontSize: 32, fontWeight: '900', color: '#191815' },
  capacity: { backgroundColor: '#FFF8EF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, color: '#A56D4D', fontWeight: '800' },
  addPanel: { backgroundColor: '#191815', borderRadius: 8, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addTitle: { color: '#FFF8EF', fontSize: 21, fontWeight: '900' },
  addCopy: { color: 'rgba(255,248,239,0.68)', marginTop: 7, maxWidth: 250, lineHeight: 20 },
  addIcon: { width: 46, height: 46, borderRadius: 8, backgroundColor: '#FFF8EF', alignItems: 'center', justifyContent: 'center' },
  filters: { gap: 8, paddingVertical: 18 },
  filter: { backgroundColor: '#FFF8EF', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9 },
  filterActive: { backgroundColor: '#191815' },
  filterText: { color: '#655C53', fontWeight: '700' },
  filterTextActive: { color: '#FFF8EF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', backgroundColor: '#FFF8EF', borderRadius: 8, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 0.86 },
  placeholder: { width: '100%', aspectRatio: 0.86, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAE0D5' },
  cardBody: { padding: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  category: { color: '#A56D4D', fontSize: 12, fontWeight: '800' },
  name: { color: '#191815', fontWeight: '900', marginTop: 7 },
  meta: { color: '#756A60', fontSize: 12, marginTop: 5 },
  empty: { alignItems: 'center', backgroundColor: '#FFF8EF', padding: 38, borderRadius: 8, marginTop: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '800', marginTop: 12 },
  emptyLink: { color: '#A56D4D', fontWeight: '800', marginTop: 10 },
  guestPage: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' },
  guestIcon: { width: 76, height: 76, borderRadius: 8, backgroundColor: '#FFF8EF', alignItems: 'center', justifyContent: 'center' },
  guestTitle: { color: '#191815', fontSize: 25, fontWeight: '900', marginTop: 22 },
  guestCopy: { color: '#756A60', lineHeight: 22, textAlign: 'center', marginTop: 12, maxWidth: 330 },
  guestButton: { width: '100%', maxWidth: 330, minHeight: 50, borderRadius: 8, backgroundColor: '#191815', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 },
  guestButtonText: { color: '#FFF8EF', fontWeight: '800' },
  guestLink: { color: '#A56D4D', fontWeight: '800', marginTop: 18 },
});
