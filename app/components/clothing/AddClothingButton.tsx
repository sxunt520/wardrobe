import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const AddClothingButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.text}>+ Add Item</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, margin: 16, alignItems: 'center' },
  text: { color: '#fff', fontWeight: '600' },
});
