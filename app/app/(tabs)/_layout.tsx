import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/ui/TabBarIcon';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#191815',
        tabBarInactiveTintColor: '#9A8C7E',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: '#FFF8EF',
          borderTopWidth: 0,
          borderRadius: 28,
          bottom: Platform.OS === 'web' ? 16 : 22,
          elevation: 16,
          height: 72,
          left: 18,
          paddingBottom: 12,
          paddingTop: 10,
          position: 'absolute',
          right: 18,
          shadowColor: '#191815',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '今日',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="sparkles" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: '衣橱',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="shirt" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '灵感',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="compass" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
