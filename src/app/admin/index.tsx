import { Stack, useRouter } from 'expo-router';

import { Hero, ListItem, palette, Screen } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';

export default function AdminHome() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'لوحة الإدارة' }} />
      <StaffGate adminOnly>
        <Screen>
          <Hero icon="shield-crown-outline" title="لوحة الإدارة" subtitle="كل ما يخص الطلبات والموظفين في مكان واحد." />
          <ListItem icon="clipboard-text-outline" title="طلبات العملاء" subtitle="مراجعة المواصفات والرد بعرض السعر" onPress={() => router.push('/admin/requests')} />
          <ListItem icon="calendar-check-outline" title="الحضور والانصراف" subtitle="حضور اليوم وآخر موقع مسجل لكل موظف" onPress={() => router.push('/admin/attendance')} />
          <ListItem icon="account-group-outline" title="الموظفون" subtitle="إضافة الموظفين ببريدهم وتحديد صلاحياتهم" onPress={() => router.push('/admin/employees')} />
          <ListItem icon="map-marker-radius-outline" title="مواقع العمل" subtitle="المواقع التي يُسمح بتسجيل الحضور منها" onPress={() => router.push('/admin/sites')} />
        </Screen>
      </StaffGate>
    </>
  );
}
