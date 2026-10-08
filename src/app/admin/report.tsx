import { Stack } from 'expo-router';
import { useState } from 'react';

import { Button, Card, Empty, ErrorText, Loading, Muted, P, Screen, Title } from '@/components/kit';
import { MonthBar } from '@/components/month-bar';
import { StaffGate } from '@/components/staff-gate';
import { shareAsCsv } from '@/lib/export-csv';
import { currentMonth, monthLabel, useMonthSheets } from '@/lib/payroll';
import { sharePdf, tableHtml } from '@/lib/pdf';

function Report() {
  const [month, setMonth] = useState(currentMonth());
  const [exporting, setExporting] = useState(false);
  const { rows, loading, error } = useMonthSheets(month);

  const exportPdf = () =>
    sharePdf(
      tableHtml(
        `تقرير الحضور · ${monthLabel(month)}`,
        ['الموظف', 'أيام العمل', 'حضور', 'غياب', 'إجازة', 'دقائق التأخير'],
        rows.map((r) => [r.name, r.workingDays, r.presentDays, r.absentDays, r.leaveDays, r.lateMinutes + r.earlyMinutes]),
      ),
    );

  const exportCsv = async () => {
    setExporting(true);
    try {
      await shareAsCsv(
        `تقرير-الحضور-${month}.csv`,
        ['الموظف', 'أيام العمل', 'حضور', 'غياب', 'إجازة', 'دقائق التأخير'],
        rows.map((r) => [r.name, String(r.workingDays), String(r.presentDays), String(r.absentDays), String(r.leaveDays), String(r.lateMinutes + r.earlyMinutes)]),
      );
    } catch {
      // Sharing can be cancelled by the user; nothing to report.
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Screen>
      <MonthBar month={month} onChange={setMonth} />
      <Button label="تصدير التقرير PDF" icon="document-outline" onPress={exportPdf} disabled={rows.length === 0} />
      <Button label="تصدير CSV" icon="download-outline" variant="outline" onPress={exportCsv} loading={exporting} disabled={rows.length === 0} />
      <ErrorText>{error}</ErrorText>
      {rows.length === 0 && !error ? <Empty icon="calendar-outline" title="لا توجد بيانات" /> : null}
      {rows.map((r) => (
        <Card key={r.email}>
          <Title>{r.name}</Title>
          <P>حضور {r.presentDays} من {r.workingDays} يوم عمل</P>
          <Muted>غياب {r.absentDays} · إجازة {r.leaveDays} · تأخير وخروج مبكر {r.lateMinutes + r.earlyMinutes} دقيقة</Muted>
        </Card>
      ))}
    </Screen>
  );
}

export default function AdminReport() {
  return (
    <>
      <Stack.Screen options={{ title: 'تقرير الحضور الشهري' }} />
      <StaffGate manager>
        <Report />
      </StaffGate>
    </>
  );
}
