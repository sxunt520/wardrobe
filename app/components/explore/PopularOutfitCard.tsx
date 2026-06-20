import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export const PopularOutfitCard = ({ title, imageUrl, likes, author, onPress }: { title: string; imageUrl?: string; likes: number; author: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
    <View style={styles.info}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.author}>by {author}</Text>
      <Text style={styles.likes}>❤️ {likes} likes</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, margin: 8, overflow: 'hidden' },
  image: { width: '100%', height: 150 },
  info: { padding: 12 },
  title: { fontSize: 16, fontWeight: '600' },
  author: { fontSize: 14, color: '#666', marginTop: 4 },
  likes: { fontSize: 14, color: '#888', marginTop: 4 },
});
