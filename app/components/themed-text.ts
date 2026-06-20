import React from 'react';
import { View } from 'react-native';

export const ThemedText = (props: any) => React.createElement(View, { ...props, testID: 'themed-text' });
export default ThemedText;
