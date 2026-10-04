import { Stack } from 'expo-router';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Badge, Button, Card, Dialog, Empty, Field, Loading, Muted, P, Row, Screen, Title } from '@/components/kit';
import { formatDate } from '@/components/quote-card';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { HR_STATUS_LABELS, HR_TYPE_LABELS } from '@/constants/hr';
import { HrRequest, HrRequestStatus } from '@/types';

function HrAdmin() {
  const [list, setList] = useState<HrRequest[] | null>(null);
  const [deciding, setDeciding] = useState<{ request: HrRequest; status: HrRequestStatus } | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return onSnapshot(
      collection(db, 'hrRequests'),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<HrRequest, 'id'>) }));
        items.sort((a, b) => {
          if ((a.status === 'pending') !== (b.status === 'pending')) return a.status === 'pending' ? -1 : 1;
          return (b.createdAt?.toMillis() ?? Date.now()) - (a.createdAt?.toMillis() ?? Date.now());
        });
        setList(items);
      },
      () => setList([]),
    );
  }, []);

  const decide = async () => {
    if (!deciding) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'hrRequests', deciding.request.id), {
        status: deciding.status,
        decisionNote: note.trim(),
      });
      setDeciding(null);
      setNote('');
    } finally {
      setSaving(false);
    }
  };

  if (list === null) return <Loading />;
  if (list.length === 0) return <Empty icon="document-text-outline" title="لا توجد طلبات" message="طلبات الإجازة والإذن من الموظفين ستظهر هنا." />;

  return (
    <Screen>
      {list.map((r) => {
        const status = HR_STATUS_LABELS[r.status];
        return (
          <Card key={r.id}>
            <Badge label={status.label} color={status.color} />
            <Title>{r.name} — {HR_TYPE_LABELS[r.type]}</Title>
            <P>{r.type === 'leave' ? `من ${r.from} إلى ${r.to} (${r.days} يوم)` : `بتاريخ ${r.from}`}</P>
            <Muted>{r.reason}</Muted>
            <Muted>{formatDate(r.createdAt)}</Muted>
            {r.decisionNote ? <Muted>ملاحظتك: {r.decisionNote}</Muted> : null}
            {r.status === 'pending' ? (
              <Row>
                <Button label="موافقة" variant="success" onPress={() => setDeciding({ request: r, status: 'approved' })} />
                <Button label="رفض" variant="danger" onPress={() => setDeciding({ request: r, status: 'rejected' })} />
              </Row>
            ) : null}
          </Card>
        );
      })}

      <Dialog
        visible={deciding !== null}
        title={deciding?.status === 'approved' ? 'الموافقة على الطلب' : 'رفض الطلب'}
        message={deciding ? `${deciding.request.name} — ${HR_TYPE_LABELS[deciding.request.type]}` : undefined}
        onClose={() => setDeciding(null)}>
        <Field label="ملاحظة للموظف (اختياري)" value={note} onChangeText={setNote} multiline />
        <Button label="تأكيد" onPress={decide} loading={saving} />
        <Button label="إلغاء" variant="outline" onPress={() => setDeciding(null)} />
      </Dialog>
    </Screen>
  );
}

export default function AdminHr() {
  return (
    <>
      <Stack.Screen options={{ title: 'الإجازات والأذونات' }} />
      <StaffGate adminOnly>
        <HrAdmin />
      </StaffGate>
    </>
  );
}
