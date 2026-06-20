import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface AvatarProps {
  source?: { uri: string };
  name?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ source, name, size = 48 }) => (
  <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
    {source ? (
      <Image source={source} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />
    ) : (
      <Text style={[styles.placeholder, { fontSize: size * 0.4 }]}>{name?.charAt(0) || '?'}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  placeholder: { color: '#fff', fontWeight: 'bold' },
});
