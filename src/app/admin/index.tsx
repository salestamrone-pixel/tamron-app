import { Stack, useRouter } from 'expo-router';

import { Card, Muted, Screen, Title } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';

export default function AdminHome() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'لوحة الإدارة' }} />
      <StaffGate adminOnly>
        <Screen>
          <Card onPress={() => router.push('/admin/requests')}>
            <Title>طلبات العملاء</Title>
            <Muted>مراجعة المواصفات والرد بعرض السعر.</Muted>
          </Card>
          <Card onPress={() => router.push('/admin/attendance')}>
            <Title>الحضور والانصراف</Title>
            <Muted>حضور اليوم وآخر موقع مسجل لكل موظف.</Muted>
          </Card>
          <Card onPress={() => router.push('/admin/employees')}>
            <Title>الموظفون</Title>
            <Muted>إضافة الموظفين ببريدهم وتحديد صلاحياتهم.</Muted>
          </Card>
          <Card onPress={() => router.push('/admin/sites')}>
            <Title>مواقع العمل</Title>
            <Muted>تحديد المواقع التي يُسمح بتسجيل الحضور منها.</Muted>
          </Card>
        </Screen>
      </StaffGate>
    </>
  );
}
