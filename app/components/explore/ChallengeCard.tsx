import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ChallengeCard = ({ title, description, points }: { title: string; description: string; points: number | string }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
    <Text style={styles.points}>{points} pts</Text>
  </View>
);

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 12, margin: 8 },
  title: { fontSize: 18, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#666' },
  points: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
});
