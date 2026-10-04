import { Stack } from 'expo-router';

import { headerOptions } from '@/components/kit';

export const unstable_settings = { initialRouteName: 'index' };

export default function HomeLayout() {
  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="services" options={{ title: 'الخدمات' }} />
      <Stack.Screen name="portfolio" options={{ title: 'معرض الأعمال' }} />
    </Stack>
  );
}
