import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { ClothingItem } from '@/types/clothing';
import { uploadImage } from '@/services/upload';
import { analyzeImageWithAI } from '@/services/ai';

interface ClothingScannerProps {
  onScanComplete?: (item: Partial<ClothingItem>) => void;
  onSuccess?: (item: Partial<ClothingItem>) => void;
}

export const ClothingScanner = ({ onScanComplete, onSuccess }: ClothingScannerProps) => {
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'analyzing' | 'failed'>('idle');
  const [previewUri, setPreviewUri] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');

  const analyzeAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    setPreviewUri(asset.uri);
    setUploadedUrl('');
    setError('');
    setPhase('uploading');
    try {
      const uploaded = await uploadImage(asset);
      setUploadedUrl(uploaded.url);
      setPhase('analyzing');
      await analyzeUploadedImage(uploaded.url, asset.uri);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '图片上传失败，请重新选择');
      setPhase('failed');
    }
  };

  const analyzeUploadedImage = async (imageUrl: string, localPreviewUri = previewUri) => {
    setError('');
    setPhase('analyzing');
    try {
      const analysis = await analyzeImageWithAI(imageUrl);
      const item: Partial<ClothingItem> = {
        name: analysis.suggestedName || analysis.name,
        category: analysis.category,
        color: analysis.color || analysis.colors?.[0] || '',
        colors: analysis.colors,
        texture: analysis.texture || analysis.material,
        material: analysis.material || analysis.texture,
        season: analysis.season,
        brand: analysis.brand,
        tags: analysis.tags || [],
        confidence: Number(analysis.confidence || 0),
        imageUrl,
        localImageUri: localPreviewUri,
      };
      onScanComplete?.(item);
      onSuccess?.(item);
    } catch (analysisError) {
      const detail = analysisError instanceof Error ? analysisError.message : 'AI 未能识别这张图片';
      setError(`${detail}。请重新上传清晰、完整、背景简单的真实衣物图片。`);
      setPhase('failed');
    }
  };

  const pickImage = async (camera: boolean) => {
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(camera ? '请在系统设置中允许衣橱管家使用相机' : '请在系统设置中允许衣橱管家访问相册');
      setPhase('failed');
      return;
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85, allowsEditing: true });
    if (!result.canceled) await analyzeAsset(result.assets[0]);
  };

  const busy = phase === 'uploading' || phase === 'analyzing';
  const statusText = phase === 'uploading'
    ? '正在上传到腾讯云 COS...'
    : phase === 'analyzing'
      ? '图片上传成功，AI 正在识别衣物...'
      : uploadedUrl
        ? '图片已上传，等待重新识别'
        : '';

  return (
    <View style={styles.container}>
      {previewUri ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
          {statusText ? <Text style={styles.status}>{statusText}</Text> : null}
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>识别没有完成</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {uploadedUrl && phase === 'failed' ? (
        <TouchableOpacity style={styles.primary} onPress={() => analyzeUploadedImage(uploadedUrl, previewUri)}>
          <Text style={styles.primaryText}>重新识别这张图片</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={styles.primary} disabled={busy} onPress={() => pickImage(true)}>
        <Text style={styles.primaryText}>{busy ? '请稍候...' : previewUri ? '重新拍摄真实衣物' : '拍照识别'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondary} disabled={busy} onPress={() => pickImage(false)}>
        <Text style={styles.secondaryText}>{previewUri ? '从相册重新选择' : '从相册选择'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12, paddingVertical: 16 },
  previewWrap: { gap: 10 },
  preview: { width: '100%', aspectRatio: 1, borderRadius: 8, backgroundColor: '#E9E7E2' },
  status: { color: '#3F6D56', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorBox: { padding: 14, borderRadius: 8, backgroundColor: '#FDECEA', borderWidth: 1, borderColor: '#F5C2BC' },
  errorTitle: { color: '#9D2C22', fontSize: 15, fontWeight: '700', marginBottom: 5 },
  errorText: { color: '#7B332C', fontSize: 14, lineHeight: 20 },
  primary: { backgroundColor: '#181818', padding: 14, borderRadius: 8, alignItems: 'center' },
  secondary: { borderWidth: 1, borderColor: '#181818', padding: 14, borderRadius: 8, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondaryText: { color: '#181818', fontWeight: '600' },
});
