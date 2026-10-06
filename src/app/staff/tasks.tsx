import { Stack } from 'expo-router';
import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Badge, Button, Card, Chip, Dialog, Empty, Field, Loading, Muted, P, Row, Screen, Title } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { TASK_STATUS } from '@/constants/hr';
import { useAuth } from '@/context/AuthContext';
import { Task, TaskStatus } from '@/types';

function MyTasks({ email }: { email: string }) {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), where('assigneeEmail', '==', email));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) }));
        list.sort((a, b) => (b.createdAt?.toMillis() ?? Date.now()) - (a.createdAt?.toMillis() ?? Date.now()));
        setTasks(list);
      },
      () => setTasks([]),
    );
  }, [email]);

  const open = (t: Task) => {
    setEditing(t);
    setStatus(t.status);
    setNote(t.note ?? '');
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'tasks', editing.id), { status, note: note.trim(), updatedAt: serverTimestamp() });
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  if (tasks === null) return <Loading />;
  if (tasks.length === 0) return <Empty icon="checkbox-outline" title="لا توجد مهام" message="المهام اللي تسندها لك الإدارة بتظهر هنا." />;

  return (
    <Screen>
      {tasks.map((t) => {
        const st = TASK_STATUS[t.status];
        return (
          <Card key={t.id}>
            <Badge label={st.label} color={st.color} />
            <Title>{t.title}</Title>
            {t.details ? <P>{t.details}</P> : null}
            {t.note ? <Muted>ملاحظتك: {t.note}</Muted> : null}
            <Button label="تحديث الحالة" variant="outline" onPress={() => open(t)} />
          </Card>
        );
      })}

      <Dialog visible={editing !== null} title={editing?.title ?? ''} onClose={() => setEditing(null)}>
        <Row>
          {(Object.keys(TASK_STATUS) as TaskStatus[]).map((s) => (
            <Chip key={s} label={TASK_STATUS[s].label} selected={status === s} onPress={() => setStatus(s)} />
          ))}
        </Row>
        <Field label="ملاحظة" value={note} onChangeText={setNote} multiline />
        <Button label="حفظ" onPress={save} loading={saving} />
        <Button label="إلغاء" variant="outline" onPress={() => setEditing(null)} />
      </Dialog>
    </Screen>
  );
}

export default function StaffTasks() {
  const { staff } = useAuth();
  return (
    <>
      <Stack.Screen options={{ title: 'مهامي' }} />
      <StaffGate>{staff ? <MyTasks email={staff.email} /> : null}</StaffGate>
    </>
  );
}
