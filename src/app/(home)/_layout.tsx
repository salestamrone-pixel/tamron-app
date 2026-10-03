import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1e88e5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'تامرون',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="services"
        options={{
          title: 'الخدمات',
        }}
      />
      <Stack.Screen
        name="portfolio"
        options={{
          title: 'معرض الأعمال',
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: 'طلباتي',
        }}
      />
    </Stack>
  );
}
