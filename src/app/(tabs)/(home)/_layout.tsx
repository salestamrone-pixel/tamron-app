import { Stack } from 'expo-router';

import { palette } from '@/components/kit';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.primary },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen name="index" options={{ title: 'تامرون' }} />
      <Stack.Screen name="services" options={{ title: 'الخدمات' }} />
      <Stack.Screen name="portfolio" options={{ title: 'معرض الأعمال' }} />
    </Stack>
  );
}
