import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/tajawal';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';

import { headerOptions } from '@/components/kit';
import { AuthProvider } from '@/context/AuthContext';
import '@/lib/tracking';

// Screens lay themselves out right-to-left explicitly, so the system must not mirror them a second time.
I18nManager.allowRTL(false);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
  });
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ ...headerOptions, headerBackTitle: 'رجوع' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
