import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ClothingItem } from '@/types/clothing';
import type { OutfitRecommendation, WeatherInfo } from '@/types/outfit';

export const OutfitGenerator = (_props: {
  clothingItem?: ClothingItem;
  clothingItems?: ClothingItem[] | string[];
  weather?: WeatherInfo | null;
  onOutfitGenerated?: (outfit: OutfitRecommendation) => void;
}) => (
  <View style={styles.container}>
    <Text>Outfit Generator Component</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 16 },
});
