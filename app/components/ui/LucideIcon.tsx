import React from 'react';
import { View } from 'react-native';
// 实际项目应使用 lucide-react-native，这里简单模拟
export const LucideIcon = ({ name, size = 24, color = '#000' }: { name: string; size?: number; color?: string }) => (
  <View testID={`icon-${name}`} style={{ width: size, height: size, backgroundColor: color, opacity: 0.5 }} />
);
