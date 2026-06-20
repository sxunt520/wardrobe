import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { deleteOutfit, getOutfitById, renderOutfitPreview, saveOutfit } from '@/services/outfit';
import type { ClothingItem } from '@/types/clothing';
import type { OutfitRecommendation } from '@/types/outfit';

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [outfit, setOutfit] = useState<OutfitRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOutfitById(id).then(setOutfit).finally(() => setLoading(false));
  }, [id]);

  const toggleSaved = async () => {
    if (!outfit) return;
    setOutfit(await saveOutfit(outfit));
  };

  const remove = () => {
    if (!outfit) return;
    Alert.alert('删除搭配', '确认删除这条搭配记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteOutfit(outfit.id);
          router.replace('/outfits/history');
        },
      },
    ]);
  };

  if (loading) return <View style={styles.center}><Text>正在加载...</Text></View>;
  if (!outfit) return <View style={styles.center}><Text>搭配记录不存在</Text></View>;

  const clothing = (outfit.items || []).filter((item): item is ClothingItem => typeof item !== 'string');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.scene}>{outfit.scene}</Text>
        <Text style={styles.score}>{outfit.score} 分</Text>
      </View>
      <Text style={styles.title}>{outfit.title}</Text>
      <Text style={styles.weather}>{typeof outfit.weather === 'string' ? outfit.weather : `${outfit.weather?.temperature || ''}℃ ${outfit.weather?.condition || ''}`}</Text>
      {outfit.imageUrl || outfit.previewImageUrl ? (
        <Image source={{ uri: outfit.imageUrl || outfit.previewImageUrl }} style={styles.preview} resizeMode="cover" />
      ) : (
        <View style={styles.previewError}>
          <Text style={styles.previewErrorTitle}>搭配效果图未生成</Text>
          <Text style={styles.previewErrorText}>{outfit.renderError || '可以重新尝试合成真实单品效果图'}</Text>
          <Button
            loading={rendering}
            onPress={async () => {
              setRendering(true);
              try { setOutfit(await renderOutfitPreview(outfit.id)); } finally { setRendering(false); }
            }}
          >
            重新生成效果图
          </Button>
        </View>
      )}
      <Text style={styles.reason}>{outfit.reason}</Text>

      <Text style={styles.sectionTitle}>真人试穿</Text>
      {outfit.tryOnImageUrl ? (
        <View style={styles.tryOnSection}>
          <Image source={{ uri: outfit.tryOnImageUrl }} style={styles.tryOnImage} resizeMode="cover" />
          <Button onPress={() => router.push({ pathname: '/outfits/try-on', params: { id: outfit.id } })}>重新试穿</Button>
        </View>
      ) : (
        <View style={styles.tryOnEntry}>
          <View style={styles.tryOnCopy}>
            <Text style={styles.tryOnTitle}>{outfit.tryOnStatus === 'processing' ? '真人试穿生成中' : '看看真人上身效果'}</Text>
            <Text style={styles.tryOnText}>{outfit.tryOnStatus === 'failed' ? outfit.tryOnError : '上传一张正面全身照，AI 会将这套搭配穿到人物身上。'}</Text>
          </View>
          <Button onPress={() => router.push({ pathname: '/outfits/try-on', params: { id: outfit.id } })}>
            {outfit.tryOnStatus === 'processing' ? '查看进度' : '开始试穿'}
          </Button>
        </View>
      )}

      <Text style={styles.sectionTitle}>搭配单品</Text>
      {clothing.length ? clothing.map((item) => (
        <View key={item.id} style={styles.item}>
          {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} /> : <View style={styles.placeholder} />}
          <View style={styles.itemText}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>{item.category} · {item.color}</Text>
          </View>
        </View>
      )) : (outfit.pieces || []).map((piece) => <Text key={piece} style={styles.piece}>{piece}</Text>)}

      <View style={styles.actions}>
        <Button onPress={toggleSaved} variant={outfit.isSaved ? 'secondary' : 'primary'}>
          {outfit.isSaved ? '取消收藏' : '收藏搭配'}
        </Button>
        <Button onPress={remove} variant="danger">删除记录</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F1E8' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scene: { color: '#A56D4D', fontWeight: '800' },
  score: { color: '#6A6258', fontWeight: '800' },
  title: { fontSize: 28, fontWeight: '900', color: '#191815', marginTop: 12 },
  weather: { color: '#8B7969', marginTop: 8 },
  preview: { width: '100%', aspectRatio: 4 / 5, borderRadius: 8, backgroundColor: '#E8DDD1', marginTop: 18 },
  previewError: { marginTop: 18, padding: 16, borderRadius: 8, backgroundColor: '#FFF8EF', gap: 10 },
  previewErrorTitle: { color: '#191815', fontWeight: '900' },
  previewErrorText: { color: '#756A60', lineHeight: 20 },
  reason: { backgroundColor: '#FFF8EF', borderRadius: 8, padding: 16, color: '#51483F', lineHeight: 22, marginTop: 18 },
  tryOnSection: { gap: 12 },
  tryOnImage: { width: '100%', aspectRatio: 3 / 4, borderRadius: 8, backgroundColor: '#E8DDD1' },
  tryOnEntry: { backgroundColor: '#E8DFD4', borderRadius: 8, padding: 16, gap: 14 },
  tryOnCopy: { gap: 6 },
  tryOnTitle: { color: '#191815', fontSize: 17, fontWeight: '900' },
  tryOnText: { color: '#655B52', lineHeight: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginTop: 24, marginBottom: 12 },
  item: { backgroundColor: '#FFF8EF', borderRadius: 8, overflow: 'hidden', flexDirection: 'row', marginBottom: 10 },
  image: { width: 92, height: 92 },
  placeholder: { width: 92, height: 92, backgroundColor: '#E8DDD1' },
  itemText: { flex: 1, padding: 14, justifyContent: 'center' },
  itemName: { fontWeight: '900', color: '#191815' },
  itemMeta: { color: '#756A60', marginTop: 6 },
  piece: { backgroundColor: '#FFF8EF', padding: 13, borderRadius: 8, marginBottom: 8, color: '#51483F' },
  actions: { gap: 12, marginTop: 24 },
});
