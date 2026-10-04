import { Tabs } from 'expo-router/js-tabs';
import { ColorValue } from 'react-native';

import { font, headerOptions, Icon, IconName, palette } from '@/components/kit';

function tabIcon(name: IconName, focusedName: IconName) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Icon name={focused ? focusedName : name} size={26} color={color as string} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        ...headerOptions,
        tabBarActiveTintColor: palette.goldLight,
        tabBarInactiveTintColor: '#8C8676',
        tabBarLabelStyle: { fontFamily: font.bold, fontSize: 12 },
        tabBarStyle: { height: 68, paddingTop: 6, paddingBottom: 8, borderTopWidth: 0, backgroundColor: palette.ink },
      }}>
      <Tabs.Screen name="profile" options={{ title: 'حسابي', tabBarIcon: tabIcon('account-circle-outline', 'account-circle') }} />
      <Tabs.Screen name="orders" options={{ title: 'طلباتي', tabBarIcon: tabIcon('clipboard-text-outline', 'clipboard-text') }} />
      <Tabs.Screen name="(home)" options={{ title: 'الرئيسية', headerShown: false, tabBarIcon: tabIcon('home-variant-outline', 'home-variant') }} />
    </Tabs>
  );
}
