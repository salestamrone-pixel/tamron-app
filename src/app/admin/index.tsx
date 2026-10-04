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
          <Hero icon="shield-checkmark-outline" title="لوحة الإدارة" subtitle="كل ما يخص الطلبات والموظفين في مكان واحد." />
          <ListItem icon="document-text-outline" color="#FF6B4A" title="طلبات العملاء" subtitle="مراجعة المواصفات والرد بعرض السعر" onPress={() => router.push('/admin/requests')} />
          <ListItem icon="calendar-outline" color="#14B8A6" title="الحضور والانصراف" subtitle="حضور اليوم وآخر موقع مسجل لكل موظف" onPress={() => router.push('/admin/attendance')} />
          <ListItem icon="calendar-number-outline" color="#F59E0B" title="الإجازات والأذونات" subtitle="الموافقة على طلبات الموظفين أو رفضها" onPress={() => router.push('/admin/hr')} />
          <ListItem icon="people-outline" color="#7C5CFF" title="الموظفون" subtitle="إضافة الموظفين ببريدهم وتحديد صلاحياتهم" onPress={() => router.push('/admin/employees')} />
          <ListItem icon="navigate-circle-outline" color="#3B82F6" title="مواقع العمل" subtitle="المواقع التي يُسمح بتسجيل الحضور منها" onPress={() => router.push('/admin/sites')} />
        </Screen>
      </StaffGate>
    </>
  );
}
