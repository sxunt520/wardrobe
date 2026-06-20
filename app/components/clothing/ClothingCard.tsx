import React from 'react';
import { Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import type { ClothingItem } from '@/types/clothing';

export const ClothingCard = ({ item, onPress, horizontal: _horizontal }: { item: ClothingItem; onPress?: () => void; horizontal?: boolean }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
    <Text style={styles.name}>{item.name}</Text>
    <Text style={styles.category}>{item.category}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 8, margin: 8, padding: 12, alignItems: 'center', width: 150 },
  image: { width: 120, height: 120, borderRadius: 8 },
  name: { marginTop: 8, fontWeight: '600' },
  category: { color: '#666', fontSize: 12 },
});
