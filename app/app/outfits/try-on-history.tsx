import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { normalizeMediaUrl } from '@/services/api';
import { deleteTryOnHistory, getTryOnHistory } from '@/services/outfit';
import type { TryOnHistoryRecord } from '@/types/outfit';

const statusMeta: Record<TryOnHistoryRecord['status'], { label: string; background: string; color: string }> = {
  submitting: { label: '提交中', background: '#E6EDF3', color: '#476176' },
  processing: { label: '生成中', background: '#E6EDF3', color: '#476176' },
  succeeded: { label: '已完成', background: '#E8F4EC', color: '#24653E' },
  failed: { label: '生成失败', background: '#FDECEA', color: '#9D2C22' },
};

export default function TryOnHistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<TryOnHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [confirmingId, setConfirmingId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setItems(await getTryOnHistory());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '试穿历史加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const remove = async (id: string) => {
    setDeletingId(id);
    setError('');
    try {
      await deleteTryOnHistory(id);
      setItems((current) => current.filter((item) => item.id !== id));
      setConfirmingId('');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '删除试穿记录失败');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => {
          setRefreshing(true);
          await load();
          setRefreshing(false);
        }} />}
      >
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#191815" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>VIRTUAL TRY-ON ARCHIVE</Text>
            <Text style={styles.title}>试穿历史</Text>
          </View>
        </View>

        {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}

        {loading ? (
          <View style={styles.center}><ActivityIndicator color="#A56D4D" /><Text style={styles.loadingText}>正在整理试穿记录...</Text></View>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="body-outline" size={52} color="#9B8C7E" />
            <Text style={styles.emptyTitle}>还没有试穿记录</Text>
            <Text style={styles.emptyText}>从任意搭配详情上传全身照，生成结果会保存在这里。</Text>
            <Pressable style={styles.primaryAction} onPress={() => router.push('/outfits/history')}>
              <Text style={styles.primaryActionText}>去选择一套搭配</Text>
            </Pressable>
          </View>
        ) : (
          items.map((item) => {
            const meta = statusMeta[item.status] || statusMeta.processing;
            const displayImage = item.resultImageUrl || item.personImageUrl;
            return (
              <View style={styles.card} key={item.id}>
                <Image source={{ uri: normalizeMediaUrl(displayImage) }} style={styles.image} resizeMode="cover" />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardTitleWrap}>
                      <Text style={styles.cardTitle} numberOfLines={2}>{item.outfitTitle || '真人试穿'}</Text>
                      <Text style={styles.cardMeta}>{item.scene || '日常'} · {formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={[styles.status, { backgroundColor: meta.background }]}>
                      <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                  </View>

                  {item.status === 'processing' || item.status === 'submitting' ? (
                    <View style={styles.notice}><ActivityIndicator size="small" color="#476176" /><Text style={styles.noticeText}>AI 正在生成，稍后下拉刷新查看结果</Text></View>
                  ) : null}
                  {item.status === 'failed' ? (
                    <View style={styles.failure}><Text style={styles.failureText}>{item.errorMessage || '生成失败，请更换清晰的正面全身照重试'}</Text></View>
                  ) : null}

                  {confirmingId === item.id ? (
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmText}>确认删除这条记录？</Text>
                      <Pressable style={styles.cancelButton} onPress={() => setConfirmingId('')}><Text style={styles.cancelText}>取消</Text></Pressable>
                      <Pressable style={styles.deleteConfirmButton} disabled={deletingId === item.id} onPress={() => remove(item.id)}>
                        {deletingId === item.id ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.deleteConfirmText}>删除</Text>}
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.actions}>
                      <Pressable style={styles.outlineAction} onPress={() => router.push(`/outfits/${item.outfitId}` as any)}>
                        <Ionicons name="shirt-outline" size={17} color="#191815" />
                        <Text style={styles.outlineActionText}>查看原搭配</Text>
                      </Pressable>
                      <Pressable style={styles.deleteAction} onPress={() => setConfirmingId(item.id)}>
                        <Ionicons name="trash-outline" size={18} color="#B42318" />
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F1E8' },
  content: { padding: 20, paddingBottom: 50 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 18 },
  iconButton: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#FFF8EF', alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  eyebrow: { color: '#8B7969', fontSize: 10, fontWeight: '800' },
  title: { color: '#191815', fontSize: 28, fontWeight: '900' },
  error: { backgroundColor: '#FDECEA', borderRadius: 8, padding: 13, marginBottom: 14 },
  errorText: { color: '#9D2C22', lineHeight: 20 },
  center: { minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: '#756A60' },
  empty: { minHeight: 430, backgroundColor: '#FFF8EF', borderRadius: 8, padding: 28, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#191815', fontSize: 20, fontWeight: '900', marginTop: 14 },
  emptyText: { color: '#756A60', textAlign: 'center', lineHeight: 21, marginTop: 8, maxWidth: 280 },
  primaryAction: { minHeight: 48, borderRadius: 8, backgroundColor: '#191815', paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  primaryActionText: { color: '#FFF8EF', fontWeight: '800' },
  card: { backgroundColor: '#FFF8EF', borderRadius: 8, overflow: 'hidden', marginBottom: 16 },
  image: { width: '100%', aspectRatio: 4 / 5, backgroundColor: '#E7DFD5' },
  cardBody: { padding: 15 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardTitleWrap: { flex: 1 },
  cardTitle: { color: '#191815', fontSize: 18, fontWeight: '900', lineHeight: 24 },
  cardMeta: { color: '#8B7969', fontSize: 12, marginTop: 5 },
  status: { borderRadius: 6, paddingHorizontal: 9, paddingVertical: 6 },
  statusText: { fontSize: 11, fontWeight: '900' },
  notice: { borderRadius: 8, padding: 11, backgroundColor: '#E6EDF3', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 13 },
  noticeText: { flex: 1, color: '#476176', fontSize: 12, lineHeight: 18 },
  failure: { borderRadius: 8, padding: 11, backgroundColor: '#FDECEA', marginTop: 13 },
  failureText: { color: '#8B332B', fontSize: 12, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 14 },
  outlineAction: { flex: 1, minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: '#D5C8BB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  outlineActionText: { color: '#191815', fontWeight: '800' },
  deleteAction: { width: 46, minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E3B7B2', alignItems: 'center', justifyContent: 'center' },
  confirmRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  confirmText: { flex: 1, color: '#655B52', fontSize: 12 },
  cancelButton: { minHeight: 40, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#D5C8BB', alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#51483F', fontWeight: '800' },
  deleteConfirmButton: { minWidth: 62, minHeight: 40, borderRadius: 8, backgroundColor: '#B42318', alignItems: 'center', justifyContent: 'center' },
  deleteConfirmText: { color: '#FFF', fontWeight: '800' },
});
