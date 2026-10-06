import { Stack } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Badge, Button, Card, Chip, Dialog, Empty, ErrorText, Field, Loading, Muted, P, Row, Screen, Title } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { TASK_STATUS } from '@/constants/hr';
import { logAudit } from '@/lib/audit';
import { StaffMember, Task } from '@/types';

function Tasks() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [assignee, setAssignee] = useState<StaffMember | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const offTasks = onSnapshot(
      collection(db, 'tasks'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) }));
        list.sort((a, b) => (b.createdAt?.toMillis() ?? Date.now()) - (a.createdAt?.toMillis() ?? Date.now()));
        setTasks(list);
      },
      () => setTasks([]),
    );
    const offStaff = onSnapshot(collection(db, 'staff'), (snap) => setStaff(snap.docs.map((d) => d.data() as StaffMember).filter((s) => s.active)));
    return () => {
      offTasks();
      offStaff();
    };
  }, []);

  const add = async () => {
    if (title.trim().length < 3 || !assignee) return setError('اكتب عنوان المهمة واختر الموظف.');
    setSaving(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        title: title.trim(),
        details: details.trim(),
        assigneeEmail: assignee.email,
        assigneeName: assignee.name,
        status: 'todo',
        note: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await logAudit('مهمة جديدة', `${title.trim()} ← ${assignee.name}`);
      setAdding(false);
      setTitle('');
      setDetails('');
      setAssignee(null);
      setError('');
    } catch {
      setError('تعذر الحفظ.');
    } finally {
      setSaving(false);
    }
  };

  if (tasks === null) return <Loading />;

  return (
    <Screen>
      <Button label="مهمة جديدة" icon="add-circle-outline" variant="gold" onPress={() => setAdding(true)} />
      {tasks.length === 0 ? <Empty icon="checkbox-outline" title="لا توجد مهام" message="وزّع أعمال التنفيذ على موظفيك وتابع حالتها من هنا." /> : null}
      {tasks.map((t) => {
        const st = TASK_STATUS[t.status];
        return (
          <Card key={t.id}>
            <Badge label={st.label} color={st.color} />
            <Title>{t.title}</Title>
            {t.details ? <P>{t.details}</P> : null}
            <Muted>الموظف: {t.assigneeName}</Muted>
            {t.note ? <Muted>ملاحظة الموظف: {t.note}</Muted> : null}
            <Row>
              <Button label="حذف" variant="danger" onPress={() => setRemoving(t)} />
            </Row>
          </Card>
        );
      })}

      <Dialog visible={adding} title="مهمة جديدة" onClose={() => setAdding(false)}>
        <ErrorText>{error}</ErrorText>
        <Field label="العنوان" value={title} onChangeText={setTitle} />
        <Field label="التفاصيل" value={details} onChangeText={setDetails} multiline />
        <Muted>إسناد إلى:</Muted>
        <Row>
          {staff.map((s) => (
            <Chip key={s.email} label={s.name} selected={assignee?.email === s.email} onPress={() => setAssignee(s)} />
          ))}
        </Row>
        <Button label="حفظ" onPress={add} loading={saving} />
        <Button label="إلغاء" variant="outline" onPress={() => setAdding(false)} />
      </Dialog>

      <Dialog visible={removing !== null} title="حذف المهمة" message={`حذف «${removing?.title ?? ''}»؟`} onClose={() => setRemoving(null)}>
        <Button
          label="حذف"
          variant="danger"
          onPress={async () => {
            if (removing) {
              await deleteDoc(doc(db, 'tasks', removing.id));
              await logAudit('حذف مهمة', removing.title);
            }
            setRemoving(null);
          }}
        />
        <Button label="إلغاء" variant="outline" onPress={() => setRemoving(null)} />
      </Dialog>
    </Screen>
  );
}

export default function AdminTasks() {
  return (
    <>
      <Stack.Screen options={{ title: 'مهام التنفيذ' }} />
      <StaffGate manager>
        <Tasks />
      </StaffGate>
    </>
  );
}
