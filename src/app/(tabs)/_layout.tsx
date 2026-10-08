import * as Notifications from 'expo-notifications';
import { Tabs } from 'expo-router/js-tabs';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountSheet } from '@/components/account-sheet';
import { SideMenu } from '@/components/side-menu';
import { font, headerOptions, Icon, IconName, palette } from '@/components/kit';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';

// Facebook/WhatsApp-style tab: a soft pill sits behind the active icon, which switches to its filled glyph.
function tabIcon(name: IconName, focusedName: IconName) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return (
      <View style={[styles.pill, focused && styles.pillActive]}>
        <Icon name={focused ? focusedName : name} size={24} color={color as string} />
      </View>
    );
  };
}

export default function TabsLayout() {
  const [accountOpen, setAccountOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [waiting, setWaiting] = useState(0);

  // Customers see a badge on "طلباتي" when the company has replied with a price.
  useEffect(() => {
    if (!user) {
      setWaiting(0);
      return;
    }
    const q = query(collection(db, 'quoteRequests'), where('userId', '==', user.uid));
    return onSnapshot(
      q,
      (snap) => setWaiting(snap.docs.filter((d) => d.data().status === 'quoted').length),
      () => setWaiting(0),
    );
  }, [user]);

  // Mirrors the same count onto the app's home-screen launcher icon.
  useEffect(() => {
    Notifications.setBadgeCountAsync(waiting).catch(() => {});
  }, [waiting]);
  return (
    <>
      <Tabs
        initialRouteName="(home)"
        backBehavior="initialRoute"
        screenOptions={{
          ...headerOptions,
          tabBarActiveTintColor: palette.ink,
          tabBarInactiveTintColor: '#8A8578',
          tabBarLabelStyle: { fontFamily: font.bold, fontSize: 11 },
          // Docked (not floating): the navigator adds the system navigation-bar inset itself,
          // so Android's back arrow can never sit on top of the icons.
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: palette.border,
            elevation: 12,
            paddingTop: 6,
            height: 68 + insets.bottom,
            paddingBottom: insets.bottom + 6,
          },
        }}>
        <Tabs.Screen
          name="profile"
          options={{ title: 'حسابي', tabBarIcon: tabIcon('person-outline', 'person') }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setAccountOpen(true);
            },
          }}
        />
        <Tabs.Screen name="orders" options={{
            title: 'طلباتي',
            tabBarIcon: tabIcon('document-text-outline', 'document-text'),
            tabBarBadge: waiting > 0 ? waiting : undefined,
            tabBarBadgeStyle: { backgroundColor: palette.danger, color: '#fff', fontFamily: font.bold },
          }} />
        <Tabs.Screen name="(home)" options={{ title: 'الرئيسية', headerShown: false, tabBarIcon: tabIcon('home-outline', 'home') }} />
      </Tabs>
      <SideMenu />
      <AccountSheet visible={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  pill: { width: 58, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: '#F4E3A8' },
});
