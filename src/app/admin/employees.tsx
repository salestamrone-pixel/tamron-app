import { Stack } from 'expo-router';
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Badge, Button, Card, Chip, Dialog, ErrorText, Field, Loading, Muted, P, palette, Row, Screen, Title } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { StaffMember, StaffRole } from '@/types';

function Employees() {
  const { user } = useAuth();
  const [list, setList] = useState<StaffMember[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<StaffMember | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState<StaffRole>('employee');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return onSnapshot(collection(db, 'staff'), (snap) => {
      const items = snap.docs.map((d) => d.data() as StaffMember);
      items.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      setList(items);
    });
  }, []);

  const add = async () => {
    const mail = email.trim().toLowerCase();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(mail)) {
      setError('اكتب الاسم وبريداً إلكترونياً صحيحاً.');
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, 'staff', mail), {
        email: mail,
        name: name.trim(),
        jobTitle: jobTitle.trim(),
        role,
        active: true,
      });
      setAdding(false);
      setName('');
      setEmail('');
      setJobTitle('');
      setRole('employee');
      setError('');
    } catch {
      setError('تعذر الحفظ.');
    } finally {
      setSaving(false);
    }
  };

  if (list === null) return <Loading />;

  return (
    <Screen>
      <Button label="إضافة موظف" onPress={() => setAdding(true)} />
      <Muted>بعد الإضافة يسجّل الموظف حساباً في التطبيق بنفس البريد ويفعّله، فتظهر له بوابة الموظفين.</Muted>

      {list.map((member) => {
        const isSelf = member.email === user?.email.toLowerCase();
        return (
          <Card key={member.email}>
            <Badge
              label={!member.active ? 'موقوف' : member.role === 'admin' ? 'مدير' : 'موظف'}
              color={!member.active ? palette.muted : member.role === 'admin' ? palette.accent : palette.primary}
            />
            <Title>{member.name}</Title>
            <P>{member.email}</P>
            {member.jobTitle ? <Muted>{member.jobTitle}</Muted> : null}
            {!isSelf ? (
              <Row>
                <Button
                  label={member.active ? 'إيقاف' : 'تفعيل'}
                  variant="outline"
                  onPress={() => updateDoc(doc(db, 'staff', member.email), { active: !member.active })}
                />
                <Button label="حذف" variant="danger" onPress={() => setRemoving(member)} />
              </Row>
            ) : null}
          </Card>
        );
      })}

      <Dialog visible={adding} title="إضافة موظف" onClose={() => setAdding(false)}>
        <ErrorText>{error}</ErrorText>
        <Field label="الاسم" value={name} onChangeText={setName} />
        <Field label="البريد الإلكتروني" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={{ textAlign: 'left' }} />
        <Field label="المسمى الوظيفي" value={jobTitle} onChangeText={setJobTitle} />
        <Row>
          <Chip label="موظف" selected={role === 'employee'} onPress={() => setRole('employee')} />
          <Chip label="مدير (صلاحيات كاملة)" selected={role === 'admin'} onPress={() => setRole('admin')} />
        </Row>
        <Button label="حفظ" onPress={add} loading={saving} />
        <Button label="إلغاء" variant="outline" onPress={() => setAdding(false)} />
      </Dialog>

      <Dialog
        visible={removing !== null}
        title="حذف الموظف"
        message={`سيفقد ${removing?.name ?? ''} صلاحية الدخول إلى بوابة الموظفين. سجل حضوره السابق يبقى محفوظاً.`}
        onClose={() => setRemoving(null)}>
        <Button
          label="حذف"
          variant="danger"
          onPress={async () => {
            if (removing) await deleteDoc(doc(db, 'staff', removing.email));
            setRemoving(null);
          }}
        />
        <Button label="إلغاء" variant="outline" onPress={() => setRemoving(null)} />
      </Dialog>
    </Screen>
  );
}

export default function AdminEmployees() {
  return (
    <>
      <Stack.Screen options={{ title: 'الموظفون' }} />
      <StaffGate adminOnly>
        <Employees />
      </StaffGate>
    </>
  );
}
