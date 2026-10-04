import { Tabs } from 'expo-router/js-tabs';
import { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { font, headerOptions, Icon, IconName, palette } from '@/components/kit';

function tabIcon(name: IconName, focusedName: IconName) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Icon name={focused ? focusedName : name} size={23} color={color as string} />;
  };
}

export default function TabsLayout() {
  // Lift the floating bar above the Android gesture/nav bar so the system
  // back arrow never sits on top of the tab icons.
  const insets = useSafeAreaInsets();
  const bottomGap = Math.max(insets.bottom, 12) + 10;

  return (
    <Tabs
      screenOptions={{
        ...headerOptions,
        tabBarActiveTintColor: palette.goldLight,
        tabBarInactiveTintColor: '#8F8A7C',
        tabBarLabelStyle: { fontFamily: font.bold, fontSize: 11, lineHeight: 18, height: 18 },
        tabBarIconStyle: { height: 26 },
        tabBarItemStyle: { height: 72, paddingTop: 10, paddingBottom: 10 },
        // A floating pill instead of an edge-to-edge bar.
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: bottomGap,
          marginHorizontal: 18,
          height: 72,
          borderRadius: 36,
          borderTopWidth: 0,
          paddingBottom: 0,
          backgroundColor: palette.ink,
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        },
      }}>
      <Tabs.Screen name="profile" options={{ title: 'حسابي', tabBarIcon: tabIcon('person-outline', 'person') }} />
      <Tabs.Screen name="orders" options={{ title: 'طلباتي', tabBarIcon: tabIcon('document-text-outline', 'document-text') }} />
      <Tabs.Screen name="(home)" options={{ title: 'الرئيسية', headerShown: false, tabBarIcon: tabIcon('home-outline', 'home') }} />
    </Tabs>
  );
}
