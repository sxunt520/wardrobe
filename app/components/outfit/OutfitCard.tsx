import React from 'react';
import { Text, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { OutfitRecommendation } from '@/types/outfit';

interface OutfitCardProps {
  outfit: OutfitRecommendation;
  onPress?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

export const OutfitCard = ({ outfit, onPress }: OutfitCardProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    {outfit.imageUrl || outfit.previewImageUrl ? (
      <Image source={{ uri: outfit.imageUrl || outfit.previewImageUrl }} style={styles.image} resizeMode="cover" />
    ) : (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>{outfit.renderStatus === 'failed' ? '效果图生成失败' : '正在准备搭配效果图'}</Text>
      </View>
    )}
    <View style={styles.body}>
      <View style={styles.meta}>
        <Text style={styles.scene}>{outfit.scene || '日常'}</Text>
        <Text style={styles.score}>{outfit.score || 0} 分</Text>
      </View>
      <Text style={styles.name}>{outfit.title || outfit.name}</Text>
      <Text style={styles.description} numberOfLines={3}>{outfit.reason || outfit.description}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF8EF', borderRadius: 8, marginBottom: 14, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 4 / 5, backgroundColor: '#EFE8DE' },
  placeholder: { width: '100%', aspectRatio: 4 / 5, backgroundColor: '#E9E1D7', alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#8B7969', fontWeight: '700' },
  body: { padding: 16 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  scene: { color: '#A56D4D', fontWeight: '800' },
  score: { color: '#6A6258', fontWeight: '800' },
  name: { color: '#191815', fontSize: 18, fontWeight: '900', marginTop: 8 },
  description: { fontSize: 13, lineHeight: 20, color: '#666', marginTop: 7 },
});
