import { Stack, useRouter } from 'expo-router';

import { Grid, Hero, Screen, Tile } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';

export default function AdminHome() {
  const router = useRouter();
  const go = (path: string) => () => router.push(path as never);
  return (
    <>
      <Stack.Screen options={{ title: 'لوحة الإدارة' }} />
      <StaffGate adminOnly>
        <Screen>
          <Hero icon="shield-checkmark-outline" title="لوحة الإدارة" subtitle="كل ما يخص الطلبات والموظفين والمتجر في مكان واحد." />
          <Grid>
            <Tile icon="document-text-outline" color="#FF6B4A" title="طلبات العملاء" onPress={go('/admin/requests')} />
            <Tile icon="calendar-outline" color="#14B8A6" title="الحضور والانصراف" onPress={go('/admin/attendance')} />
            <Tile icon="calendar-number-outline" color="#F59E0B" title="الإجازات والأذونات" onPress={go('/admin/hr')} />
            <Tile icon="storefront-outline" color="#EC4899" title="إدارة المتجر" onPress={go('/admin/store')} />
            <Tile icon="people-outline" color="#7C5CFF" title="الموظفون" onPress={go('/admin/employees')} />
            <Tile icon="navigate-circle-outline" color="#3B82F6" title="مواقع العمل" onPress={go('/admin/sites')} />
          </Grid>
        </Screen>
      </StaffGate>
    </>
  );
}
