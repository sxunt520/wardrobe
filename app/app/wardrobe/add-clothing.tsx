import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ClothingScanner } from '@/components/clothing/ClothingScanner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CATEGORIES, MATERIALS, SEASONS } from '@/constants';
import { addClothingItem } from '@/services/clothing';
import { useWardrobeStore } from '@/stores/wardrobeStore';
import type { ClothingItem } from '@/types/clothing';

const emptyItem: Partial<ClothingItem> = {
  name: '',
  category: '上衣',
  color: '',
  texture: '',
  season: '四季',
  imageUrl: '',
  tags: [],
};

export default function AddClothingScreen() {
  const router = useRouter();
  const addToStore = useWardrobeStore((state) => state.addClothingItem);
  const [item, setItem] = useState<Partial<ClothingItem>>(emptyItem);
  const [mode, setMode] = useState<'scan' | 'form'>('scan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const save = async () => {
    if (!item.name?.trim() || !item.category) {
      setError('请填写衣物名称和类别');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const created = await addClothingItem(item);
      if (!created?.id) throw new Error('服务器未返回衣物记录，请稍后重试');
      addToStore(created);
      setSuccess('衣物已保存到你的衣橱');
      setTimeout(() => router.back(), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加衣物失败');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'scan') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>添加衣物</Text>
        <Text style={styles.subtitle}>上传图片后，AI 会自动填写衣物信息</Text>
        <ClothingScanner
          onSuccess={(result) => {
            setItem({ ...emptyItem, ...result });
            setMode('form');
          }}
        />
        <TouchableOpacity onPress={() => setMode('form')}>
          <Text style={styles.link}>不识别，直接手动添加</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>确认衣物信息</Text>
      <Text style={styles.subtitle}>识别结果可以在保存前修改</Text>
      {item.localImageUri || item.imageUrl ? (
        <View style={styles.imageSection}>
          <Image source={{ uri: item.localImageUri || item.imageUrl }} style={styles.image} resizeMode="cover" />
          <View style={styles.uploadedBadge}><Text style={styles.uploadedText}>图片已上传</Text></View>
          <TouchableOpacity disabled={loading} onPress={() => { setError(''); setSuccess(''); setMode('scan'); }}>
            <Text style={styles.changeImage}>重新拍摄或选择图片</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>保存失败</Text>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
      {success ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}

      <Input label="名称" value={item.name || ''} onChangeText={(name) => setItem((current) => ({ ...current, name }))} />
      <Input label="颜色" value={item.color || ''} onChangeText={(color) => setItem((current) => ({ ...current, color }))} />
      <Input label="品牌（可选）" value={item.brand || ''} onChangeText={(brand) => setItem((current) => ({ ...current, brand }))} />

      <Text style={styles.label}>类别</Text>
      <View style={styles.options}>
        {CATEGORIES.map((option) => (
          <TouchableOpacity key={option.value} style={[styles.option, item.category === option.value && styles.active]} onPress={() => setItem((current) => ({ ...current, category: option.value }))}>
            <Text style={item.category === option.value ? styles.activeText : styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>季节</Text>
      <View style={styles.options}>
        {SEASONS.map((option) => (
          <TouchableOpacity key={option.value} style={[styles.option, item.season === option.value && styles.active]} onPress={() => setItem((current) => ({ ...current, season: option.value }))}>
            <Text style={item.season === option.value ? styles.activeText : styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>材质</Text>
      <View style={styles.options}>
        {MATERIALS.map((material) => (
          <TouchableOpacity key={material} style={[styles.option, item.texture === material && styles.active]} onPress={() => setItem((current) => ({ ...current, texture: material, material }))}>
            <Text style={item.texture === material ? styles.activeText : styles.optionText}>{material}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button onPress={save} loading={loading} disabled={loading || Boolean(success)}>
        {loading ? '正在保存...' : success ? '保存成功' : '保存衣物'}
      </Button>
      {loading ? <Text style={styles.savingHint}>正在保存衣物，请勿重复点击</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7f7f5' },
  content: { paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#181818', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 20 },
  imageSection: { marginBottom: 20, alignItems: 'center', gap: 10 },
  image: { width: '100%', aspectRatio: 1, borderRadius: 8, backgroundColor: '#E9E7E2' },
  uploadedBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#E8F4EC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  uploadedText: { color: '#24653E', fontSize: 13, fontWeight: '700' },
  changeImage: { color: '#315B48', fontWeight: '600', textDecorationLine: 'underline' },
  label: { fontSize: 15, fontWeight: '600', marginTop: 8, marginBottom: 10 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  option: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#d8d8d4', backgroundColor: '#fff' },
  active: { backgroundColor: '#181818', borderColor: '#181818' },
  optionText: { color: '#333' },
  activeText: { color: '#fff' },
  link: { textAlign: 'center', color: '#555', textDecorationLine: 'underline', marginTop: 12 },
  errorBox: { padding: 14, borderRadius: 8, backgroundColor: '#FDECEA', borderWidth: 1, borderColor: '#F5C2BC', marginBottom: 16 },
  errorTitle: { color: '#9D2C22', fontSize: 15, fontWeight: '700', marginBottom: 5 },
  error: { color: '#7B332C', lineHeight: 20 },
  successBox: { padding: 14, borderRadius: 8, backgroundColor: '#E8F4EC', borderWidth: 1, borderColor: '#BCDCC7', marginBottom: 16 },
  successText: { color: '#24653E', fontWeight: '700', textAlign: 'center' },
  savingHint: { marginTop: 10, color: '#666', fontSize: 13, textAlign: 'center' },
});
