import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { OutfitCard } from '@/components/outfit/OutfitCard';
import { getOutfitHistory } from '@/services/outfit';
import type { OutfitRecommendation } from '@/types/outfit';
import { useRouter } from 'expo-router';

export default function OutfitHistoryScreen() {
  const [items, setItems] = useState<OutfitRecommendation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    setItems(await getOutfitHistory());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
    >
      <Text style={styles.title}>搭配历史</Text>
      {items.length ? items.map((item) => (
        <OutfitCard key={item.id} outfit={item} onPress={() => router.push(`/outfits/${item.id}` as any)} />
      )) : <Text style={styles.empty}>还没有生成过搭配</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f5' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 18 },
  empty: { color: '#777', textAlign: 'center', marginTop: 80 },
});
