import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export const ClothingFilter = ({ categories = ['All', 'Top', 'Bottom', 'Dress', 'Outerwear', 'Accessories'], selectedCategory = 'All', onSelectCategory }: { categories?: string[]; selectedCategory?: string; onSelectCategory: (category: string) => void }) => (
  <View style={styles.container}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {categories.map(cat => (
        <TouchableOpacity key={cat} style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnActive]} onPress={() => onSelectCategory?.(cat)}>
          <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { paddingVertical: 8, backgroundColor: '#fff' },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  categoryBtnActive: { backgroundColor: '#4CAF50' },
  categoryText: { color: '#333' },
  categoryTextActive: { color: '#fff' },
});
