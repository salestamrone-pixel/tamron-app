import { Stack } from 'expo-router';
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Badge, Button, Card, Chip, Dialog, Empty, ErrorText, Field, Muted, P, Row, Screen, Title } from '@/components/kit';
import { formatDate } from '@/components/quote-card';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { ANNUAL_LEAVE_DAYS, DATE_PATTERN, daysBetween, HR_STATUS_LABELS, HR_TYPE_LABELS } from '@/constants/hr';
import { todayKey } from '@/lib/geo';
import { HrRequest, HrRequestType, StaffMember } from '@/types';

function Requests({ staff }: { staff: StaffMember }) {
  const [list, setList] = useState<HrRequest[]>([]);
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<HrRequestType>('leave');
  const [from, setFrom] = useState(todayKey());
  const [to, setTo] = useState(todayKey());
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'hrRequests'), where('email', '==', staff.email));
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<HrRequest, 'id'>) }));
      items.sort((a, b) => (b.createdAt?.toMillis() ?? Date.now()) - (a.createdAt?.toMillis() ?? Date.now()));
      setList(items);
    });
  }, [staff.email]);

  const year = String(new Date().getFullYear());
  const used = list
    .filter((r) => r.type === 'leave' && r.status === 'approved' && r.from.startsWith(year))
    .reduce((sum, r) => sum + r.days, 0);
  const remaining = Math.max(ANNUAL_LEAVE_DAYS - used, 0);

  const submit = async () => {
    if (!DATE_PATTERN.test(from) || !DATE_PATTERN.test(to)) {
      setError('اكتب التاريخ بالشكل 2026-10-25.');
      return;
    }
    const days = type === 'leave' ? daysBetween(from, to) : 1;
    if (days < 1) {
      setError('تاريخ النهاية لازم يكون بعد تاريخ البداية.');
      return;
    }
    if (type === 'leave' && days > remaining) {
      setError(`رصيدك المتبقي ${remaining} يوم فقط.`);
      return;
    }
    if (reason.trim().length < 3) {
      setError('اكتب سبب الطلب.');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'hrRequests'), {
        email: staff.email,
        name: staff.name,
        type,
        from,
        to: type === 'leave' ? to : from,
        days,
        reason: reason.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setAdding(false);
      setReason('');
      setError('');
    } catch {
      setError('تعذر إرسال الطلب. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Card>
        <Title>رصيد الإجازة السنوية</Title>
        <P>المتبقي {remaining} يوم من {ANNUAL_LEAVE_DAYS}</P>
        <Muted>المستخدم هذا العام: {used} يوم.</Muted>
      </Card>

      <Button label="طلب جديد" icon="add-circle-outline" variant="gold" onPress={() => setAdding(true)} />

      {list.length === 0 ? <Empty icon="document-text-outline" title="لا توجد طلبات" message="ستظهر هنا طلبات الإجازة والإذن وحالتها." /> : null}

      {list.map((r) => {
        const status = HR_STATUS_LABELS[r.status];
        return (
          <Card key={r.id}>
            <Badge label={status.label} color={status.color} />
            <Title>{HR_TYPE_LABELS[r.type]}</Title>
            <P>{r.type === 'leave' ? `من ${r.from} إلى ${r.to} (${r.days} يوم)` : `بتاريخ ${r.from}`}</P>
            <Muted>{r.reason}</Muted>
            {r.decisionNote ? <Muted>ملاحظة الإدارة: {r.decisionNote}</Muted> : null}
            <Muted>{formatDate(r.createdAt)}</Muted>
          </Card>
        );
      })}

      <Dialog visible={adding} title="طلب جديد" onClose={() => setAdding(false)}>
        <ErrorText>{error}</ErrorText>
        <Row>
          <Chip label="إجازة" selected={type === 'leave'} onPress={() => setType('leave')} />
          <Chip label="إذن" selected={type === 'permission'} onPress={() => setType('permission')} />
        </Row>
        <Field label={type === 'leave' ? 'من تاريخ' : 'التاريخ'} value={from} onChangeText={setFrom} placeholder="2026-10-25" style={{ textAlign: 'left' }} />
        {type === 'leave' ? <Field label="إلى تاريخ" value={to} onChangeText={setTo} placeholder="2026-10-27" style={{ textAlign: 'left' }} /> : null}
        <Field label="السبب" value={reason} onChangeText={setReason} multiline />
        <Button label="إرسال الطلب" icon="paper-plane-outline" onPress={submit} loading={saving} />
        <Button label="إلغاء" variant="outline" onPress={() => setAdding(false)} />
      </Dialog>
    </Screen>
  );
}

export default function StaffRequests() {
  const { staff } = useAuth();
  return (
    <>
      <Stack.Screen options={{ title: 'إجازاتي وأذوناتي' }} />
      <StaffGate>{staff ? <Requests staff={staff} /> : null}</StaffGate>
    </>
  );
}
