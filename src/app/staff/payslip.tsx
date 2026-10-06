import { Stack } from 'expo-router';
import { useState } from 'react';

import { Button, Card, ErrorText, Loading, Muted, P, Screen, Title } from '@/components/kit';
import { MonthBar } from '@/components/month-bar';
import { StaffGate } from '@/components/staff-gate';
import { useAuth } from '@/context/AuthContext';
import { currentMonth, fmtMoney, monthLabel, useMonthSheets } from '@/lib/payroll';
import { payslipHtml, sharePdf } from '@/lib/pdf';

function Payslip({ email }: { email: string }) {
  const [month, setMonth] = useState(currentMonth());
  const { rows, loading, error } = useMonthSheets(month, email);
  const s = rows[0];

  return (
    <Screen>
      <MonthBar month={month} onChange={setMonth} />
      <ErrorText>{error}</ErrorText>
      {loading ? <Loading /> : null}
      {!loading && s ? (
        <>
          <Card>
            <Title>{monthLabel(month)}</Title>
            <P>صافي الراتب: {fmtMoney(s.net)}</P>
            <Muted>الراتب {fmtMoney(s.salary)} + البدلات {fmtMoney(s.allowances)}</Muted>
          </Card>
          <Card>
            <Title>الخصومات</Title>
            <P>الغياب ({s.absentDays} يوم): {fmtMoney(s.absentDeduction)}</P>
            <P>التأخير والخروج المبكر ({s.lateMinutes + s.earlyMinutes} دقيقة): {fmtMoney(s.lateDeduction)}</P>
            <P>السلف: {fmtMoney(s.advances)}</P>
            <P>التأمينات: {fmtMoney(s.gosi)}</P>
            <Muted>الإجمالي: {fmtMoney(s.totalDeductions)}</Muted>
          </Card>
          <Card>
            <Title>الدوام</Title>
            <P>حضور {s.presentDays} من {s.workingDays} يوم عمل · إجازة {s.leaveDays}</P>
          </Card>
          <Button label="تحميل القسيمة PDF" icon="document-outline" onPress={() => sharePdf(payslipHtml(s, month))} />
          <Muted>الأرقام تقديرية حتى اعتماد الكشف من الإدارة نهاية الشهر.</Muted>
        </>
      ) : null}
    </Screen>
  );
}

export default function StaffPayslip() {
  const { staff } = useAuth();
  return (
    <>
      <Stack.Screen options={{ title: 'قسيمة راتبي' }} />
      <StaffGate>{staff ? <Payslip email={staff.email} /> : null}</StaffGate>
    </>
  );
}
