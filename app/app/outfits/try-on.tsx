import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { getOutfitById, getTryOnStatus, startTryOn } from '@/services/outfit';
import { uploadImage } from '@/services/upload';
import type { OutfitRecommendation } from '@/types/outfit';

export default function TryOnScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [outfit, setOutfit] = useState<OutfitRecommendation | null>(null);
  const [localUri, setLocalUri] = useState('');
  const [personImageUrl, setPersonImageUrl] = useState('');
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'submitting' | 'processing' | 'failed' | 'succeeded'>('idle');
  const [error, setError] = useState('');
  const pollCount = useRef(0);

  useEffect(() => {
    if (!id) return;
    getOutfitById(id).then((value) => {
      setOutfit(value);
      if (value.tryOnImageUrl) setPhase('succeeded');
      else if (value.tryOnStatus === 'processing') setPhase('processing');
      else if (value.tryOnStatus === 'failed') {
        setPhase('failed');
        setError(value.tryOnError || '真人试穿生成失败');
      }
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : '搭配加载失败'));
  }, [id]);

  useEffect(() => {
    if (!id || phase !== 'processing') return;
    const timer = setInterval(async () => {
      pollCount.current += 1;
      try {
        const value = await getTryOnStatus(id);
        setOutfit(value);
        if (value.tryOnStatus === 'succeeded') {
          setPhase('succeeded');
          clearInterval(timer);
        } else if (value.tryOnStatus === 'failed') {
          setPhase('failed');
          setError(value.tryOnError || '真人试穿生成失败，请更换全身照重试');
          clearInterval(timer);
        } else if (pollCount.current >= 60) {
          setPhase('failed');
          setError('生成时间较长，任务仍可能在后台继续。稍后可返回搭配详情查看。');
          clearInterval(timer);
        }
      } catch (pollError) {
        setError(pollError instanceof Error ? pollError.message : '查询试穿进度失败');
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [id, phase]);

  const choosePhoto = async (camera: boolean) => {
    setError('');
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(camera ? '请允许使用相机后重试' : '请允许访问相册后重试');
      return;
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9, allowsEditing: false })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9, allowsEditing: false });
    if (result.canceled) return;
    const asset = result.assets[0];
    setLocalUri(asset.uri);
    setPersonImageUrl('');
    setPhase('uploading');
    try {
      const uploaded = await uploadImage(asset);
      setPersonImageUrl(uploaded.url);
      setPhase('idle');
    } catch (uploadError) {
      setPhase('failed');
      setError(uploadError instanceof Error ? uploadError.message : '全身照上传失败');
    }
  };

  const submit = async () => {
    if (!id || !personImageUrl) {
      setError('请先上传一张清晰的正面全身照');
      return;
    }
    setPhase('submitting');
    setError('');
    pollCount.current = 0;
    try {
      const value = await startTryOn(id, personImageUrl);
      setOutfit(value);
      if (value.tryOnStatus === 'failed') {
        setPhase('failed');
        setError(value.tryOnError || '试穿任务提交失败');
      } else {
        setPhase('processing');
      }
    } catch (submitError) {
      setPhase('failed');
      setError(submitError instanceof Error ? submitError.message : '试穿任务提交失败');
    }
  };

  const busy = ['uploading', 'submitting', 'processing'].includes(phase);
  const statusText = phase === 'uploading'
    ? '正在上传全身照到腾讯云 COS...'
    : phase === 'submitting'
      ? '正在提交 AI 试穿任务...'
      : phase === 'processing'
        ? 'AI 正在生成真人试穿图，通常需要 1-3 分钟...'
        : '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color="#191815" /></Pressable>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>AI VIRTUAL TRY-ON</Text>
          <Text style={styles.title}>真人试穿</Text>
        </View>
      </View>

      <View style={styles.guide}>
        <Text style={styles.guideTitle}>照片要求</Text>
        <Text style={styles.guideText}>正面站立、完整露出头部到脚部、单人、光线均匀，避免遮挡和宽松外套。</Text>
      </View>

      {outfit?.tryOnImageUrl && phase === 'succeeded' ? (
        <>
          <Image source={{ uri: outfit.tryOnImageUrl }} style={styles.result} resizeMode="cover" />
          <View style={styles.success}><Ionicons name="checkmark-circle" size={21} color="#24653E" /><Text style={styles.successText}>真人试穿图已生成并保存到腾讯云 COS</Text></View>
          <Button onPress={() => { setPhase('idle'); setLocalUri(''); setPersonImageUrl(''); }}>换一张全身照</Button>
          <Pressable style={styles.historyButton} onPress={() => router.push('/outfits/try-on-history')}>
            <Ionicons name="time-outline" size={19} color="#191815" />
            <Text style={styles.historyButtonText}>查看试穿历史</Text>
          </Pressable>
        </>
      ) : (
        <>
          {localUri ? (
            <Image source={{ uri: localUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="body-outline" size={54} color="#8B7969" />
              <Text style={styles.placeholderTitle}>上传正面全身照</Text>
              <Text style={styles.placeholderText}>图片只用于本次试穿生成</Text>
            </View>
          )}

          {statusText ? <View style={styles.status}><Text style={styles.statusText}>{statusText}</Text></View> : null}
          {error ? <View style={styles.error}><Text style={styles.errorTitle}>生成没有完成</Text><Text style={styles.errorText}>{error}</Text></View> : null}

          <View style={styles.photoActions}>
            <Pressable style={styles.photoButton} disabled={busy} onPress={() => choosePhoto(true)}><Ionicons name="camera-outline" size={19} /><Text style={styles.photoButtonText}>拍摄全身照</Text></Pressable>
            <Pressable style={styles.photoButton} disabled={busy} onPress={() => choosePhoto(false)}><Ionicons name="images-outline" size={19} /><Text style={styles.photoButtonText}>从相册选择</Text></Pressable>
          </View>
          <Button onPress={submit} loading={busy} disabled={!personImageUrl || busy}>
            {phase === 'processing' ? 'AI 正在生成试穿图...' : '开始真人试穿'}
          </Button>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F1E8' },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 18 },
  back: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#FFF8EF', alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  eyebrow: { color: '#8B7969', fontSize: 10, fontWeight: '800' },
  title: { color: '#191815', fontSize: 28, fontWeight: '900' },
  guide: { backgroundColor: '#E8DFD4', borderRadius: 8, padding: 15, marginBottom: 16 },
  guideTitle: { color: '#191815', fontWeight: '900' },
  guideText: { color: '#655B52', lineHeight: 20, marginTop: 6 },
  photo: { width: '100%', aspectRatio: 3 / 4, borderRadius: 8, backgroundColor: '#E7DFD5' },
  result: { width: '100%', aspectRatio: 3 / 4, borderRadius: 8, backgroundColor: '#E7DFD5' },
  placeholder: { width: '100%', aspectRatio: 3 / 4, borderRadius: 8, backgroundColor: '#FFF8EF', alignItems: 'center', justifyContent: 'center' },
  placeholderTitle: { color: '#191815', fontSize: 18, fontWeight: '900', marginTop: 14 },
  placeholderText: { color: '#8B7969', marginTop: 6 },
  photoActions: { flexDirection: 'row', gap: 10, marginVertical: 14 },
  photoButton: { flex: 1, minHeight: 50, borderRadius: 8, borderWidth: 1, borderColor: '#CFC1B3', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  photoButtonText: { color: '#191815', fontWeight: '800' },
  status: { padding: 13, borderRadius: 8, backgroundColor: '#E6EDF3', marginTop: 12 },
  statusText: { color: '#476176', textAlign: 'center', lineHeight: 20 },
  error: { padding: 14, borderRadius: 8, backgroundColor: '#FDECEA', marginTop: 12 },
  errorTitle: { color: '#9D2C22', fontWeight: '900' },
  errorText: { color: '#7B332C', lineHeight: 20, marginTop: 5 },
  success: { padding: 13, borderRadius: 8, backgroundColor: '#E8F4EC', flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 14 },
  successText: { flex: 1, color: '#24653E', fontWeight: '700' },
  historyButton: { minHeight: 48, marginTop: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CFC1B3', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  historyButtonText: { color: '#191815', fontWeight: '800' },
});
