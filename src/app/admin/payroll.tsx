import { Stack, useRouter } from 'expo-router';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';

import { Badge, Button, Card, Dialog, Empty, ErrorText, Field, Loading, Muted, P, palette, Row, Screen, Title } from '@/components/kit';
import { MonthBar } from '@/components/month-bar';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { logAudit } from '@/lib/audit';
import { currentMonth, fmtMoney, monthLabel, Sheet, useMonthSheets } from '@/lib/payroll';
import { payslipHtml, sharePdf, tableHtml } from '@/lib/pdf';

function Payroll() {
  const router = useRouter();
  const [month, setMonth] = useState(currentMonth());
  const { rows, gosi, loading, error, reload } = useMonthSheets(month);
  const [detail, setDetail] = useState<Sheet | null>(null);
  const [advanceFor, setAdvanceFor] = useState<Sheet | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [gosiInput, setGosiInput] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const total = rows.reduce((s, r) => s + r.net, 0);

  const addAdvance = async () => {
    const value = Number(amount);
    if (!advanceFor || !Number.isFinite(value) || value <= 0) return setFormError('اكتب مبلغاً صحيحاً.');
    setBusy(true);
    try {
      await addDoc(collection(db, 'advances'), { email: advanceFor.email, amount: value, month, note: note.trim(), at: serverTimestamp() });
      await logAudit('سلفة', `${advanceFor.email} · ${value} ريال · ${month}`);
      setAdvanceFor(null);
      setAmount('');
      setNote('');
      setFormError('');
      reload();
    } catch {
      setFormError('تعذر الحفظ.');
    } finally {
      setBusy(false);
    }
  };

  const saveGosi = async () => {
    const v = Number(gosiInput);
    if (!Number.isFinite(v) || v < 0 || v > 30) return setFormError('اكتب نسبة بين 0 و30.');
    await setDoc(doc(db, 'settings', 'payroll'), { gosiPercent: v });
    await logAudit('نسبة التأمينات', `${v}%`);
    setGosiInput(null);
    setFormError('');
    reload();
  };

  const exportAll = () =>
    sharePdf(
      tableHtml(
        `كشف رواتب · ${monthLabel(month)}`,
        ['الموظف', 'الأساسي', 'البدلات', 'الغياب', 'التأخير', 'السلف', 'التأمينات', 'الصافي'],
        rows.map((r) => [r.name, r.salary, r.allowances, r.absentDeduction, r.lateDeduction, r.advances, r.gosi, r.net]),
      ),
    );

  if (loading) return <Loading />;

  return (
    <Screen>
      <MonthBar month={month} onChange={setMonth} />
      <Card>
        <Title>إجمالي صافي الرواتب</Title>
        <P>{fmtMoney(total)}</P>
        <Muted>{rows.length} موظف · نسبة التأمينات للسعوديين: {gosi}%</Muted>
        <Row>
          <Button label="تصدير الكشف PDF" icon="document-outline" onPress={exportAll} disabled={rows.length === 0} />
          <Button label="نسبة التأمينات" variant="outline" onPress={() => setGosiInput(String(gosi))} />
        </Row>
        <Muted>الخصومات تُحسب من الحضور الفعلي حتى اليوم. أرقام الراتب والدوام تُضبط من بيانات كل موظف.</Muted>
      </Card>
      <ErrorText>{error}</ErrorText>
      {rows.length === 0 && !error ? <Empty icon="people-outline" title="لا يوجد موظفون" message="أضف الموظفين من لوحة الإدارة أولاً." /> : null}

      {rows.map((r) => (
        <Card key={r.email}>
          {r.salary === 0 ? <Badge label="لم يُحدَّد راتب" color={palette.danger} /> : null}
          <Title>{r.name}</Title>
          <P>صافي الراتب: {fmtMoney(r.net)}</P>
          <Muted>
            حضور {r.presentDays} · غياب {r.absentDays} · إجازة {r.leaveDays} · تأخير {r.lateMinutes + r.earlyMinutes} دقيقة
          </Muted>
          <Row>
            <Button label="التفاصيل" variant="outline" onPress={() => setDetail(r)} />
            <Button label="سلفة" variant="outline" onPress={() => setAdvanceFor(r)} />
            <Button label="بيانات الموظف" variant="outline" onPress={() => router.push({ pathname: '/admin/employee', params: { email: r.email } })} />
          </Row>
        </Card>
      ))}

      <Dialog visible={detail !== null} title={detail?.name ?? ''} message={monthLabel(month)} onClose={() => setDetail(null)}>
        {detail ? (
          <>
            <P>الأساسي: {fmtMoney(detail.salary)}</P>
            <P>البدلات: {fmtMoney(detail.allowances)}</P>
            <P>خصم الغياب ({detail.absentDays} يوم): {fmtMoney(detail.absentDeduction)}</P>
            <P>خصم التأخير ({detail.lateMinutes + detail.earlyMinutes} دقيقة): {fmtMoney(detail.lateDeduction)}</P>
            <P>السلف: {fmtMoney(detail.advances)}</P>
            <P>التأمينات: {fmtMoney(detail.gosi)}</P>
            <Title>الصافي: {fmtMoney(detail.net)}</Title>
            <Button label="قسيمة الراتب PDF" icon="document-outline" onPress={() => sharePdf(payslipHtml(detail, month))} />
          </>
        ) : null}
        <Button label="إغلاق" variant="outline" onPress={() => setDetail(null)} />
      </Dialog>

      <Dialog visible={advanceFor !== null} title="تسجيل سلفة" message={advanceFor?.name} onClose={() => setAdvanceFor(null)}>
        <ErrorText>{formError}</ErrorText>
        <Field label="المبلغ (ريال)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={{ textAlign: 'left' }} />
        <Field label="ملاحظة" value={note} onChangeText={setNote} />
        <Button label="حفظ" onPress={addAdvance} loading={busy} />
        <Button label="إلغاء" variant="outline" onPress={() => setAdvanceFor(null)} />
      </Dialog>

      <Dialog visible={gosiInput !== null} title="نسبة التأمينات الاجتماعية" message="تُخصم من الراتب الأساسي للموظفين السعوديين فقط. اكتب النسبة المعتمدة لدى محاسبك." onClose={() => setGosiInput(null)}>
        <ErrorText>{formError}</ErrorText>
        <Field label="النسبة %" value={gosiInput ?? ''} onChangeText={setGosiInput} keyboardType="decimal-pad" style={{ textAlign: 'left' }} />
        <Button label="حفظ" onPress={saveGosi} />
        <Button label="إلغاء" variant="outline" onPress={() => setGosiInput(null)} />
      </Dialog>
    </Screen>
  );
}

export default function AdminPayroll() {
  return (
    <>
      <Stack.Screen options={{ title: 'الرواتب والخصومات' }} />
      <StaffGate manager>
        <Payroll />
      </StaffGate>
    </>
  );
}
