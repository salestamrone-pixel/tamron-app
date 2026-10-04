import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { palette } from '@/components/kit';
import { AuthProvider } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: palette.primary },
            headerTintColor: '#fff',
            headerTitleAlign: 'center',
            headerBackTitle: 'رجوع',
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
