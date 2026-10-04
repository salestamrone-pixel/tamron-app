import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { palette } from '@/components/kit';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={palette.card}
      indicatorColor="#e0ecf7"
      labelStyle={{ selected: { color: palette.primary } }}>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>الرئيسية</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="orders">
        <NativeTabs.Trigger.Label>طلباتي</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>حسابي</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
