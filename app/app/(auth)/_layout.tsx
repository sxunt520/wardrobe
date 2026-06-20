import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthLayout() {
  return (
    <LinearGradient
      colors={['#4a6cf7', '#8c52ff']}
      style={styles.gradient}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
