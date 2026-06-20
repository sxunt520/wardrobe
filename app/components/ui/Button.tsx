import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';

interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'destructive';
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({ title, children, onPress, loading, disabled, variant = 'primary', style }) => (
  <TouchableOpacity
    style={[styles.button, styles[variant === 'destructive' ? 'danger' : variant], disabled && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled || loading}
  >
    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{children ?? title}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center' },
  primary: { backgroundColor: '#4CAF50' },
  secondary: { backgroundColor: '#2196F3' },
  danger: { backgroundColor: '#F44336' },
  disabled: { opacity: 0.6 },
  text: { color: '#fff', fontWeight: '600' },
});
