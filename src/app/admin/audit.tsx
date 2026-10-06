import { Stack } from 'expo-router';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Card, Empty, Loading, Muted, P, Screen, Title } from '@/components/kit';
import { formatDate } from '@/components/quote-card';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';

interface Entry {
  id: string;
  by: string;
  byName: string;
  action: string;
  detail: string;
  at: { toDate: () => Date } | null;
}

function Audit() {
  const [items, setItems] = useState<Entry[] | null>(null);
  useEffect(() => {
    const q = query(collection(db, 'audit'), orderBy('at', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Entry, 'id'>) }))),
      () => setItems([]),
    );
  }, []);

  if (items === null) return <Loading />;
  if (items.length === 0) return <Empty icon="shield-checkmark-outline" title="لا توجد عمليات مسجلة" message="كل تعديل مهم في التطبيق يظهر هنا باسم من قام به ووقته." />;

  return (
    <Screen>
      <Muted>آخر 100 عملية. لا يمكن تعديلها أو حذفها من التطبيق.</Muted>
      {items.map((e) => (
        <Card key={e.id}>
          <Title>{e.action}</Title>
          {e.detail ? <P>{e.detail}</P> : null}
          <Muted>{e.byName || e.by} · {formatDate(e.at, true)}</Muted>
        </Card>
      ))}
    </Screen>
  );
}

export default function AdminAudit() {
  return (
    <>
      <Stack.Screen options={{ title: 'سجل العمليات' }} />
      <StaffGate adminOnly>
        <Audit />
      </StaffGate>
    </>
  );
}
