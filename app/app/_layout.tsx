import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme, ActivityIndicator, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const authChecked = useRef(false);

  useEffect(() => {
    if (authChecked.current) return;
    authChecked.current = true;
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = ['wardrobe', 'outfits', 'profile'].includes(String(segments[0]));
    if (!isAuthenticated && inProtectedGroup) router.replace('/(auth)/login');
    if (isAuthenticated && inAuthGroup) router.replace('/(tabs)');
  }, [isAuthenticated, isLoading, router, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="wardrobe/add-clothing" />
          <Stack.Screen name="wardrobe/[id]" />
          <Stack.Screen name="outfits/generator" />
          <Stack.Screen name="outfits/history" />
          <Stack.Screen name="outfits/[id]" />
          <Stack.Screen name="outfits/try-on" />
          <Stack.Screen name="outfits/try-on-history" />
          <Stack.Screen name="profile/edit" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
