import { StyleSheet, Text, View } from 'react-native';
import type { ClothingItem } from '@/types/clothing';

export const VirtualTryOnView = ({ clothingItem }: { clothingItem: ClothingItem; onResult?: (result: unknown) => void }) => (
  <View style={styles.container}>
    <Text style={styles.text}>已选择：{clothingItem.name}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f2f2ef', borderRadius: 8 },
  text: { color: '#333' },
});

export default VirtualTryOnView;
