import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: any;
  borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 16, 
  style, 
  borderRadius = 8 
}) => {
  const opacity = useSharedValue(0.4);

  opacity.value = withRepeat(
    withTiming(0.8, { duration: 800 }),
    -1,
    true
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
  },
});
