import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLocation } from '@/hooks/useLocation';
import { useWeather } from '@/hooks/useWeather';
import { getClothingItems } from '@/services/clothing';
import { generateOutfits, getOutfitHistory } from '@/services/outfit';
import { getExploreFeed, getWardrobeReport } from '@/services/wardrobeApp';
import type { ClothingItem } from '@/types/clothing';
import type { OutfitRecommendation } from '@/types/outfit';

const heroImage = require('@/assets/fashion/portrait.jpg');

export default function HomeScreen() {
  const router = useRouter();
  const { location, loading: locationLoading, error: locationError, getLocation } = useLocation();
  const { weather, loading: weatherLoading, error: weatherError, refresh: refreshWeather } = useWeather(location);
  const [outfits, setOutfits] = useState<OutfitRecommendation[]>([]);
  const [clothing, setClothing] = useState<ClothingItem[]>([]);
  const [report, setReport] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    const [nextClothing, history, nextReport, explore] = await Promise.all([
      getClothingItems(),
      getOutfitHistory(),
      getWardrobeReport(),
      getExploreFeed(),
    ]);
    setClothing(nextClothing);
    setOutfits(history.slice(0, 2));
    setReport(nextReport);
    setChallenge(explore?.challenges?.[0] || null);
  }, []);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  const generate = async () => {
    if (!clothing.length) {
      router.push('/wardrobe/add-clothing');
      return;
    }
    setGenerating(true);
    try {
      const next = await generateOutfits({
        scene: '通勤',
        weather: weather || '多云',
        temperature: weather?.temperature || 23,
      });
      setOutfits(next);
    } finally {
      setGenerating(false);
    }
  };

  const weatherText = locationLoading
    ? '正在获取位置'
    : weatherLoading
      ? '正在获取天气'
    : weather
      ? `${location?.city || '当前位置'} · ${weather.temperature}℃ · ${weather.condition}`
      : weatherError || locationError || '天气未获取';
  const retryWeather = async () => {
    if (!location) await getLocation();
    else refreshWeather();
  };
  const categoryCount = new Set(clothing.map((item) => item.category)).size;
  const colors = Object.entries(report?.colorUsage || {})
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 3);
  const weatherAdvice = weather
    ? weather.temperature <= 12
      ? '今天偏冷，建议加入外套并选择保暖材质。'
      : weather.temperature >= 28
        ? '今天偏热，优先选择轻薄、透气的单品。'
        : '温度舒适，适合用叠穿和配饰增加层次。'
    : '允许位置权限后，会根据当地天气调整穿搭。';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>AI DAILY STYLIST</Text>
            <Text style={styles.title}>衣橱管家</Text>
          </View>
          <Pressable style={styles.historyButton} onPress={() => router.push('/outfits/history')}>
            <Ionicons name="time-outline" size={21} color="#191815" />
          </Pressable>
        </View>

        <ImageBackground source={heroImage} style={styles.hero} imageStyle={styles.heroImage} resizeMode="cover">
          <View style={styles.heroShade} />
          <View style={styles.heroContent}>
            <Pressable style={styles.weather} onPress={retryWeather}>
              <Ionicons name={weather ? 'partly-sunny-outline' : 'refresh-outline'} size={15} color="#FFF8EF" />
              <Text style={styles.weatherText}>{weatherText}</Text>
            </Pressable>
            <Text style={styles.heroTitle}>
              {clothing.length ? `从你的 ${clothing.length} 件衣物中，穿出今天。` : '先录入衣物，开始每日搭配。'}
            </Text>
            <Text style={styles.heroCopy}>{weatherAdvice}</Text>
            <Pressable style={styles.generateButton} onPress={generate} disabled={generating}>
              {generating ? <ActivityIndicator color="#191815" /> : <Ionicons name={clothing.length ? 'sparkles' : 'camera-outline'} size={18} color="#191815" />}
              <Text style={styles.generateText}>{generating ? '正在生成' : clothing.length ? '生成今日穿搭' : '添加第一件衣物'}</Text>
            </Pressable>
          </View>
        </ImageBackground>

        <View style={styles.quickGrid}>
          <QuickAction icon="camera-outline" label="录入衣物" copy="拍照 AI 识别" color="#DCE9DF" onPress={() => router.push('/wardrobe/add-clothing')} />
          <QuickAction icon="options-outline" label="场景搭配" copy="约会、通勤、出差" color="#E8DFD4" onPress={() => router.push('/outfits/generator')} />
          <QuickAction icon="compass-outline" label="穿搭灵感" copy="挑战与热门榜" color="#DCE3EA" onPress={() => router.push('/(tabs)/explore')} />
          <QuickAction icon="time-outline" label="历史收藏" copy="回看最近搭配" color="#E9DFE3" onPress={() => router.push('/outfits/history')} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>衣橱脉搏</Text>
          <Pressable onPress={() => router.push('/(tabs)/wardrobe')}><Text style={styles.link}>进入衣橱</Text></Pressable>
        </View>
        <View style={styles.statsBand}>
          <Stat value={String(clothing.length)} label="全部衣物" />
          <Stat value={String(categoryCount)} label="覆盖分类" />
          <Stat value={String(report?.frequentItems || 0)} label="常穿单品" />
          <Stat value={String(report?.favoriteItems || 0)} label="收藏单品" />
        </View>

        <View style={styles.insightRow}>
          <View style={styles.palettePanel}>
            <Text style={styles.panelLabel}>常用色彩</Text>
            {colors.length ? colors.map(([color, count]: any, index) => (
              <View key={color} style={styles.colorLine}>
                <View style={[styles.colorSwatch, { backgroundColor: palette[index] }]} />
                <Text style={styles.colorName}>{color}</Text>
                <Text style={styles.colorCount}>{count} 件</Text>
              </View>
            )) : <Text style={styles.panelEmpty}>录入衣物后生成色彩分析</Text>}
          </View>
          <View style={styles.missingPanel}>
            <Ionicons name="bag-add-outline" size={22} color="#A56D4D" />
            <Text style={styles.panelLabel}>衣橱短板</Text>
            <Text style={styles.missingText}>{(report?.missingItems || []).slice(0, 2).join('、') || '暂未发现明显短板'}</Text>
            <Text style={styles.missingCopy}>优先补充高复用单品</Text>
          </View>
        </View>

        {challenge ? (
          <Pressable style={styles.challengeBand} onPress={() => router.push('/(tabs)/explore')}>
            <View style={styles.challengeIcon}><Ionicons name="sparkles" size={21} color="#FFF8EF" /></View>
            <View style={styles.challengeText}>
              <Text style={styles.challengeTag}>{challenge.tag || '#今日灵感'} · 今日挑战</Text>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#FFF8EF" />
          </Pressable>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>最近搭配</Text>
          <Pressable onPress={() => router.push('/outfits/history')}>
            <Text style={styles.link}>查看全部</Text>
          </Pressable>
        </View>

        {outfits.length ? outfits.map((outfit) => (
          <Pressable key={outfit.id} style={styles.outfitCard} onPress={() => router.push(`/outfits/${outfit.id}` as any)}>
            {outfit.imageUrl || outfit.previewImageUrl ? <Image source={{ uri: outfit.imageUrl || outfit.previewImageUrl }} style={styles.outfitImage} /> : null}
            <View style={styles.outfitTop}>
              <Text style={styles.scene}>{outfit.scene || '日常'}</Text>
              <Text style={styles.score}>{outfit.score || 0} 分</Text>
            </View>
            <Text style={styles.outfitTitle}>{outfit.title}</Text>
            <Text style={styles.reason}>{outfit.reason}</Text>
            <View style={styles.pieces}>
              {(outfit.pieces || []).map((piece) => <Text key={piece} style={styles.piece}>{piece}</Text>)}
            </View>
          </Pressable>
        )) : (
          <View style={styles.empty}>
            <Ionicons name="shirt-outline" size={30} color="#8B7969" />
            <Text style={styles.emptyTitle}>还没有搭配记录</Text>
            <Text style={styles.emptyText}>录入衣物后生成第一套今日穿搭。</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const palette = ['#6F8294', '#C8A884', '#8D6E63'];

function QuickAction({ icon, label, copy, color, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; copy: string; color: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.quickAction, { backgroundColor: color }]} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#191815" />
      <Text style={styles.quickLabel}>{label}</Text>
      <Text style={styles.quickCopy}>{copy}</Text>
    </Pressable>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F1E8' },
  content: { padding: 20, paddingBottom: 110 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  eyebrow: { color: '#8B7969', fontSize: 11, fontWeight: '800' },
  title: { color: '#191815', fontSize: 34, fontWeight: '900' },
  historyButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF8EF', alignItems: 'center', justifyContent: 'center' },
  hero: { minHeight: 360, borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  heroImage: { borderRadius: 8 },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(16,15,13,0.48)' },
  heroContent: { padding: 22 },
  weather: { alignSelf: 'flex-start', backgroundColor: 'rgba(25,24,21,0.52)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  weatherText: { color: '#FFF8EF', fontWeight: '700', maxWidth: 260 },
  heroTitle: { color: '#FFF8EF', fontSize: 29, lineHeight: 36, fontWeight: '900', maxWidth: 330 },
  heroCopy: { color: 'rgba(255,248,239,0.72)', fontSize: 14, lineHeight: 22, marginTop: 14 },
  generateButton: { marginTop: 22, minHeight: 48, borderRadius: 8, paddingHorizontal: 16, backgroundColor: '#FFF8EF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  generateText: { color: '#191815', fontWeight: '800' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  quickAction: { width: '48%', minHeight: 118, borderRadius: 8, padding: 15, justifyContent: 'flex-end' },
  quickLabel: { color: '#191815', fontSize: 16, fontWeight: '900', marginTop: 13 },
  quickCopy: { color: '#5F554C', fontSize: 11, marginTop: 4 },
  sectionHeader: { marginTop: 28, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#191815' },
  link: { color: '#A56D4D', fontWeight: '700' },
  statsBand: { minHeight: 94, backgroundColor: '#191815', borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: '#FFF8EF', fontSize: 22, fontWeight: '900' },
  statLabel: { color: 'rgba(255,248,239,0.58)', fontSize: 10, marginTop: 5 },
  insightRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  palettePanel: { flex: 1.18, minHeight: 168, backgroundColor: '#FFF8EF', borderRadius: 8, padding: 15 },
  missingPanel: { flex: 0.82, minHeight: 168, backgroundColor: '#E8DFD4', borderRadius: 8, padding: 15 },
  panelLabel: { color: '#191815', fontWeight: '900', marginTop: 8, marginBottom: 10 },
  colorLine: { minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorSwatch: { width: 20, height: 20, borderRadius: 4 },
  colorName: { flex: 1, color: '#51483F', fontSize: 12 },
  colorCount: { color: '#8B7969', fontSize: 11 },
  panelEmpty: { color: '#8B7969', fontSize: 12, lineHeight: 18 },
  missingText: { color: '#191815', fontSize: 17, lineHeight: 23, fontWeight: '900', marginTop: 6 },
  missingCopy: { color: '#756A60', fontSize: 11, lineHeight: 16, marginTop: 8 },
  challengeBand: { minHeight: 92, borderRadius: 8, backgroundColor: '#A56D4D', marginTop: 16, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  challengeIcon: { width: 42, height: 42, borderRadius: 7, backgroundColor: 'rgba(25,24,21,0.28)', alignItems: 'center', justifyContent: 'center' },
  challengeText: { flex: 1 },
  challengeTag: { color: '#F2DCCC', fontSize: 11, fontWeight: '800' },
  challengeTitle: { color: '#FFF8EF', fontWeight: '900', marginTop: 5 },
  outfitCard: { backgroundColor: '#FFF8EF', borderRadius: 8, padding: 17, marginBottom: 12 },
  outfitImage: { width: '100%', aspectRatio: 16 / 10, borderRadius: 7, backgroundColor: '#E8DDD1', marginBottom: 14 },
  outfitTop: { flexDirection: 'row', justifyContent: 'space-between' },
  scene: { color: '#A56D4D', fontWeight: '800' },
  score: { color: '#6A6258', fontWeight: '700' },
  outfitTitle: { color: '#191815', fontSize: 19, fontWeight: '900', marginTop: 10 },
  reason: { color: '#6A6258', lineHeight: 21, marginTop: 8 },
  pieces: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 13 },
  piece: { backgroundColor: '#F0E5D9', color: '#51483F', borderRadius: 6, paddingHorizontal: 9, paddingVertical: 6, fontSize: 12 },
  empty: { alignItems: 'center', backgroundColor: '#FFF8EF', padding: 32, borderRadius: 8 },
  emptyTitle: { fontWeight: '800', fontSize: 17, marginTop: 12 },
  emptyText: { color: '#777', marginTop: 6 },
});
