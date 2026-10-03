import { Stack } from 'expo-router';

export default function AuthLayout() {
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
        name="login"
        options={{
          title: 'تسجيل الدخول',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'إنشاء حساب',
        }}
      />
    </Stack>
  );
}
