import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Button, Chip, ErrorText, Field, Loading, Muted, Row, Screen, Section } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { DATE_PATTERN } from '@/constants/hr';
import { logAudit } from '@/lib/audit';
import { StaffMember } from '@/types';

const num = (v: string) => (v.trim() === '' ? 0 : Number(v));
const OPTIONAL_DATE = (v: string) => v.trim() === '' || DATE_PATTERN.test(v.trim());

function Editor({ email }: { email: string }) {
  const router = useRouter();
  const [member, setMember] = useState<StaffMember | null>(null);
  const [f, setF] = useState({
    name: '',
    jobTitle: '',
    nationality: 'saudi',
    idNumber: '',
    idExpiry: '',
    hireDate: '',
    contractEnd: '',
    salary: '',
    allowances: '',
    shiftStart: '08:00',
    shiftEnd: '17:00',
    graceMin: '15',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'staff', email)).then((snap) => {
      if (!snap.exists()) return;
      const m = snap.data() as StaffMember;
      setMember(m);
      setF({
        name: m.name ?? '',
        jobTitle: m.jobTitle ?? '',
        nationality: m.nationality ?? 'saudi',
        idNumber: m.idNumber ?? '',
        idExpiry: m.idExpiry ?? '',
        hireDate: m.hireDate ?? '',
        contractEnd: m.contractEnd ?? '',
        salary: m.salary ? String(m.salary) : '',
        allowances: m.allowances ? String(m.allowances) : '',
        shiftStart: m.shiftStart ?? '08:00',
        shiftEnd: m.shiftEnd ?? '17:00',
        graceMin: String(m.graceMin ?? 15),
      });
    });
  }, [email]);

  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const save = async () => {
    if (!f.name.trim()) return setError('اكتب اسم الموظف.');
    if (![f.idExpiry, f.hireDate, f.contractEnd].every(OPTIONAL_DATE)) return setError('اكتب التواريخ بالشكل 2026-10-25.');
    if (!/^\d{2}:\d{2}$/.test(f.shiftStart) || !/^\d{2}:\d{2}$/.test(f.shiftEnd)) return setError('اكتب وقت الدوام بالشكل 08:00.');
    if ([f.salary, f.allowances, f.graceMin].some((v) => Number.isNaN(num(v)) || num(v) < 0)) return setError('الراتب والبدلات والسماح لازم أرقام صحيحة.');
    setSaving(true);
    setError('');
    try {
      await updateDoc(doc(db, 'staff', email), {
        name: f.name.trim(),
        jobTitle: f.jobTitle.trim(),
        nationality: f.nationality,
        idNumber: f.idNumber.trim(),
        idExpiry: f.idExpiry.trim(),
        hireDate: f.hireDate.trim(),
        contractEnd: f.contractEnd.trim(),
        salary: num(f.salary),
        allowances: num(f.allowances),
        shiftStart: f.shiftStart,
        shiftEnd: f.shiftEnd,
        graceMin: num(f.graceMin),
      });
      await logAudit('تعديل بيانات موظف', `${email}`);
      router.back();
    } catch {
      setError('تعذر الحفظ.');
    } finally {
      setSaving(false);
    }
  };

  if (!member) return <Loading />;

  return (
    <Screen>
      <Muted>{email}</Muted>
      <ErrorText>{error}</ErrorText>
      <Field label="الاسم" value={f.name} onChangeText={set('name')} />
      <Field label="المسمى الوظيفي" value={f.jobTitle} onChangeText={set('jobTitle')} />
      <Section>البيانات الشخصية</Section>
      <Row>
        <Chip label="سعودي" selected={f.nationality === 'saudi'} onPress={() => set('nationality')('saudi')} />
        <Chip label="وافد" selected={f.nationality === 'expat'} onPress={() => set('nationality')('expat')} />
      </Row>
      <Field label="رقم الهوية / الإقامة" value={f.idNumber} onChangeText={set('idNumber')} keyboardType="number-pad" style={{ textAlign: 'left' }} />
      <Field label="انتهاء الهوية / الإقامة" placeholder="2027-05-30" value={f.idExpiry} onChangeText={set('idExpiry')} style={{ textAlign: 'left' }} />
      <Field label="تاريخ التعيين" placeholder="2024-01-15" value={f.hireDate} onChangeText={set('hireDate')} style={{ textAlign: 'left' }} />
      <Field label="انتهاء العقد" placeholder="2027-01-14" value={f.contractEnd} onChangeText={set('contractEnd')} style={{ textAlign: 'left' }} />
      <Section>الراتب</Section>
      <Field label="الراتب الأساسي (ريال)" value={f.salary} onChangeText={set('salary')} keyboardType="decimal-pad" style={{ textAlign: 'left' }} />
      <Field label="البدلات (ريال)" value={f.allowances} onChangeText={set('allowances')} keyboardType="decimal-pad" style={{ textAlign: 'left' }} />
      <Section>الدوام</Section>
      <Field label="بداية الدوام" value={f.shiftStart} onChangeText={set('shiftStart')} style={{ textAlign: 'left' }} />
      <Field label="نهاية الدوام" value={f.shiftEnd} onChangeText={set('shiftEnd')} style={{ textAlign: 'left' }} />
      <Field label="فترة السماح (دقيقة)" value={f.graceMin} onChangeText={set('graceMin')} keyboardType="number-pad" style={{ textAlign: 'left' }} />
      <Button label="حفظ" icon="checkmark" onPress={save} loading={saving} />
    </Screen>
  );
}

export default function AdminEmployee() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  return (
    <>
      <Stack.Screen options={{ title: 'بيانات الموظف' }} />
      <StaffGate manager>{email ? <Editor email={email} /> : null}</StaffGate>
    </>
  );
}
