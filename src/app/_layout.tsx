import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/tajawal';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';

import { FloatingWhatsApp } from '@/components/floating-whatsapp';
import { Intro } from '@/components/intro';
import { headerOptions } from '@/components/kit';
import { AuthProvider } from '@/context/AuthContext';
import { registerNotificationResponseHandler } from '@/lib/push';
import { recordAppOpen } from '@/lib/visit-tracker';
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
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    recordAppOpen();
  }, []);

  useEffect(() => registerNotificationResponseHandler(), []);

  if (!ready) return null;

  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ ...headerOptions, headerBackTitle: 'رجوع' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        {introDone ? <FloatingWhatsApp /> : null}
        {!introDone ? <Intro onDone={finishIntro} /> : null}
      </ThemeProvider>
    </AuthProvider>
  );
}
