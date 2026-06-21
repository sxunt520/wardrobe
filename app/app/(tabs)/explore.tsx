import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { getExploreFeed } from '@/services/wardrobeApp';
import { useAuthStore } from '@/stores/authStore';

type Challenge = {
  id: string;
  tag: string;
  title: string;
  reward: string;
  participants: number;
  colors: string[];
};

type PopularOutfit = {
  id: string;
  name: string;
  scene: string;
  score: number;
  reason: string;
};

export default function ExploreScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [popularOutfits, setPopularOutfits] = useState<PopularOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await getExploreFeed();
      setChallenges(data?.challenges || []);
      setPopularOutfits(data?.popularOutfits || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '灵感内容加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <Text style={styles.eyebrow}>STYLE DISCOVERY</Text>
        <Text style={styles.title}>穿搭灵感</Text>
        <Text style={styles.subtitle}>从主题挑战和高分搭配里，找到今天的新组合。</Text>

        {error ? (
          <Pressable style={styles.errorBox} onPress={load}>
            <Text style={styles.errorTitle}>加载失败，点击重试</Text>
            <Text style={styles.errorText}>{error}</Text>
          </Pressable>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>每日挑战</Text>
          <Text style={styles.sectionMeta}>{challenges.length} 个主题</Text>
        </View>

        {loading ? <ActivityIndicator style={styles.loader} color="#A56D4D" /> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.challengeList}>
          {challenges.map((challenge) => (
            <View key={challenge.id} style={styles.challenge}>
              <View style={styles.colorRow}>
                {(challenge.colors || []).slice(0, 3).map((color) => <View key={color} style={[styles.color, { backgroundColor: color }]} />)}
              </View>
              <Text style={styles.tag}>{challenge.tag}</Text>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.reward}>{challenge.reward} · {challenge.participants} 人参与</Text>
              <Pressable style={styles.challengeButton} onPress={() => router.push(isAuthenticated ? '/outfits/generator' : '/(auth)/login')}>
                <Ionicons name="sparkles" size={16} color="#191815" />
                <Text style={styles.challengeButtonText}>{isAuthenticated ? '生成主题搭配' : '登录后参与挑战'}</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>热门搭配榜</Text>
          <Text style={styles.sectionMeta}>AI 精选</Text>
        </View>
        {popularOutfits.map((outfit, index) => (
          <View key={outfit.id} style={styles.ranking}>
            <Text style={styles.rank}>{String(index + 1).padStart(2, '0')}</Text>
            <View style={styles.rankingBody}>
              <View style={styles.rankingTop}>
                <Text style={styles.rankingName}>{outfit.name} · {outfit.scene}</Text>
                <Text style={styles.score}>{outfit.score} 分</Text>
              </View>
              <Text style={styles.reason}>{outfit.reason}</Text>
            </View>
          </View>
        ))}

        <View style={styles.comingSoon}>
          <Ionicons name="people-outline" size={23} color="#8B7969" />
          <View style={styles.comingText}>
            <Text style={styles.comingTitle}>社区投稿与作品审核</Text>
            <Text style={styles.comingCopy}>后台审核能力已完成，APP 投稿入口开发中。</Text>
          </View>
          <Text style={styles.badge}>开发中</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F1E8' },
  content: { padding: 20, paddingBottom: 110 },
  eyebrow: { color: '#8B7969', fontSize: 11, fontWeight: '800' },
  title: { fontSize: 32, fontWeight: '900', color: '#191815', marginTop: 2 },
  subtitle: { color: '#756A60', lineHeight: 21, marginTop: 7, marginBottom: 10 },
  errorBox: { marginTop: 14, padding: 14, borderRadius: 8, backgroundColor: '#FDECEA', borderWidth: 1, borderColor: '#F5C2BC' },
  errorTitle: { color: '#9D2C22', fontWeight: '800' },
  errorText: { color: '#7B332C', marginTop: 5 },
  sectionHeader: { marginTop: 24, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#191815', fontSize: 21, fontWeight: '900' },
  sectionMeta: { color: '#8B7969', fontSize: 12, fontWeight: '700' },
  loader: { paddingVertical: 30 },
  challengeList: { gap: 12, paddingRight: 20 },
  challenge: { width: 286, minHeight: 226, padding: 18, borderRadius: 8, backgroundColor: '#191815' },
  colorRow: { flexDirection: 'row', gap: 7 },
  color: { width: 24, height: 24, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)' },
  tag: { color: '#EED8C6', fontWeight: '800', marginTop: 16 },
  challengeTitle: { color: '#FFF8EF', fontSize: 20, lineHeight: 27, fontWeight: '900', marginTop: 8 },
  reward: { color: 'rgba(255,248,239,0.62)', fontSize: 12, marginTop: 10 },
  challengeButton: { minHeight: 42, marginTop: 'auto', borderRadius: 7, backgroundColor: '#FFF8EF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  challengeButtonText: { color: '#191815', fontWeight: '800' },
  ranking: { flexDirection: 'row', backgroundColor: '#FFF8EF', borderRadius: 8, padding: 16, marginBottom: 10, gap: 14 },
  rank: { color: '#A56D4D', fontSize: 21, fontWeight: '900' },
  rankingBody: { flex: 1 },
  rankingTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  rankingName: { flex: 1, color: '#191815', fontWeight: '900' },
  score: { color: '#A56D4D', fontWeight: '900' },
  reason: { color: '#6A6258', lineHeight: 20, marginTop: 7 },
  comingSoon: { marginTop: 14, minHeight: 78, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#D8C9BA', flexDirection: 'row', alignItems: 'center', gap: 12 },
  comingText: { flex: 1 },
  comingTitle: { color: '#191815', fontWeight: '900' },
  comingCopy: { color: '#756A60', fontSize: 12, lineHeight: 18, marginTop: 4 },
  badge: { color: '#8B5A3C', backgroundColor: '#EED8C6', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 5, fontSize: 11, fontWeight: '800' },
});
