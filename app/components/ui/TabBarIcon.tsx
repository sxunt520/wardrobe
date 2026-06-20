import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export const TabBarIcon = ({ name, color, size = 24, filled: _filled }: { name: React.ComponentProps<typeof Ionicons>['name']; color?: string; size?: number; filled?: boolean }) => (
  <Ionicons name={name} size={size} color={color || '#888'} />
);
