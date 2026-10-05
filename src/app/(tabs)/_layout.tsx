import { Tabs } from 'expo-router/js-tabs';
import { useState } from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';

import { AccountSheet } from '@/components/account-sheet';
import { font, headerOptions, Icon, IconName, palette } from '@/components/kit';

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
  return (
    <>
      <Tabs
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
        <Tabs.Screen name="orders" options={{ title: 'طلباتي', tabBarIcon: tabIcon('document-text-outline', 'document-text') }} />
        <Tabs.Screen name="(home)" options={{ title: 'الرئيسية', headerShown: false, tabBarIcon: tabIcon('home-outline', 'home') }} />
      </Tabs>
      <AccountSheet visible={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  pill: { width: 58, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: '#F4E3A8' },
});
