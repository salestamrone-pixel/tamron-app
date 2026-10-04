import { Tabs, TabList, TabSlot, TabTrigger, TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text } from 'react-native';

import { palette } from '@/components/kit';

export default function AppTabs() {
  return (
    <Tabs style={styles.root}>
      <TabList style={styles.tabList}>
        <TabTrigger name="home" href="/" asChild>
          <TabButton>الرئيسية</TabButton>
        </TabTrigger>
        <TabTrigger name="orders" href="/orders" asChild>
          <TabButton>طلباتي</TabButton>
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <TabButton>حسابي</TabButton>
        </TabTrigger>
      </TabList>
      <TabSlot style={styles.slot} />
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={[styles.tab, isFocused && styles.tabFocused]}>
      <Text style={[styles.tabText, isFocused && styles.tabTextFocused]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  slot: { flex: 1 },
  tabList: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: palette.card,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  tab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20 },
  tabFocused: { backgroundColor: '#e0ecf7' },
  tabText: { fontSize: 15, color: palette.muted },
  tabTextFocused: { color: palette.primary, fontWeight: '700' },
});
