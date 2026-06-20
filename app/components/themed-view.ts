import React from 'react';
import { View } from 'react-native';

export const ThemedView = (props: any) => React.createElement(View, { ...props, testID: 'themed-view' });
export default ThemedView;
