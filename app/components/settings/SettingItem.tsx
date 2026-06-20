import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const SettingItem = ({ label, value, onPress, icon }: { label: string; value?: string; onPress?: () => void; icon?: React.ReactNode }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    {icon && <View style={styles.icon}>{icon}</View>}
    <Text style={styles.label}>{label}</Text>
    {value && <Text style={styles.value}>{value}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  icon: { marginRight: 12 },
  label: { flex: 1, fontSize: 16 },
  value: { color: '#666', fontSize: 14 },
});
