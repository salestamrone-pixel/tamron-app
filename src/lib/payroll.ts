import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import { db } from '@/config/firebase';
import { todayKey } from '@/lib/geo';
import { Advance, AttendanceRecord, HrRequest, StaffMember } from '@/types';

// Sunday = 0 ... Saturday = 6. Friday and Saturday are the weekend.
export const WEEKEND_DAYS = [5, 6];

export interface Sheet {
  email: string;
  name: string;
  jobTitle: string;
  nationality: string;
  salary: number;
  allowances: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateMinutes: number;
  earlyMinutes: number;
  absentDeduction: number;
  lateDeduction: number;
  advances: number;
  gosi: number;
  totalDeductions: number;
  net: number;
}

const p2 = (n: number) => String(n).padStart(2, '0');
const money = (n: number) => Math.round(n * 100) / 100;

export const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}`;
};

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}`;
}

export function monthLabel(month: string) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('ar', { month: 'long', year: 'numeric' });
}

export function fmtMoney(n: number) {
  return `${money(n).toLocaleString('ar', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ر.س`;
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const minutesOfDay = (ts: { toDate: () => Date } | null | undefined) => {
  if (!ts) return null;
  const d = ts.toDate();
  return d.getHours() * 60 + d.getMinutes();
};

export function computeSheet(
  member: StaffMember,
  month: string,
  records: AttendanceRecord[],
  leaves: HrRequest[],
  advances: Advance[],
  gosiPercent: number,
  now = new Date(),
): Sheet {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const startMin = toMin(member.shiftStart || '08:00');
  const endMin = toMin(member.shiftEnd || '17:00');
  const grace = member.graceMin ?? 15;
  const shiftHours = Math.max((endMin - startMin) / 60, 1);
  const salary = member.salary ?? 0;
  const allowances = member.allowances ?? 0;
  const dailyRate = (salary + allowances) / 30;
  const minuteRate = dailyRate / shiftHours / 60;

  const byDate = new Map(records.map((r) => [r.date, r]));
  const leaveDates = new Set<string>();
  for (const l of leaves) {
    const a = new Date(`${l.from}T00:00:00`);
    const b = new Date(`${l.to}T00:00:00`);
    for (let t = a.getTime(); t <= b.getTime(); t += 86400000) {
      const d = new Date(t);
      leaveDates.add(`${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`);
    }
  }

  const today = todayKey(now);
  let workingDays = 0;
  let presentDays = 0;
  let absentDays = 0;
  let leaveDays = 0;
  let lateMinutes = 0;
  let earlyMinutes = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${month}-${p2(day)}`;
    if (WEEKEND_DAYS.includes(new Date(y, m - 1, day).getDay())) continue;
    if (date > today) continue;
    if (member.hireDate && date < member.hireDate) continue;
    workingDays++;
    if (leaveDates.has(date)) {
      leaveDays++;
      continue;
    }
    const rec = byDate.get(date);
    if (!rec) {
      absentDays++;
      continue;
    }
    presentDays++;
    const inMin = minutesOfDay(rec.checkIn);
    if (inMin !== null) lateMinutes += Math.max(0, inMin - startMin - grace);
    const outMin = minutesOfDay(rec.checkOut);
    if (outMin !== null) earlyMinutes += Math.max(0, endMin - grace - outMin);
  }

  const absentDeduction = absentDays * dailyRate;
  const lateDeduction = (lateMinutes + earlyMinutes) * minuteRate;
  const advanceTotal = advances.reduce((s, a) => s + a.amount, 0);
  const gosi = member.nationality === 'saudi' ? (salary * gosiPercent) / 100 : 0;
  const totalDeductions = absentDeduction + lateDeduction + advanceTotal + gosi;
  const net = Math.max(salary + allowances - totalDeductions, 0);

  return {
    email: member.email,
    name: member.name,
    jobTitle: member.jobTitle,
    nationality: member.nationality ?? '',
    salary,
    allowances,
    workingDays,
    presentDays,
    absentDays,
    leaveDays,
    lateMinutes,
    earlyMinutes,
    absentDeduction: money(absentDeduction),
    lateDeduction: money(lateDeduction),
    advances: money(advanceTotal),
    gosi: money(gosi),
    totalDeductions: money(totalDeductions),
    net: money(net),
  };
}

export function useMonthSheets(month: string, onlyEmail?: string) {
  const [state, setState] = useState<{ loading: boolean; rows: Sheet[]; gosi: number; error: string }>({
    loading: true,
    rows: [],
    gosi: 0,
    error: '',
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const [y, m] = month.split('-').map(Number);
      const start = `${month}-01`;
      const end = `${month}-${p2(new Date(y, m, 0).getDate())}`;

      let members: StaffMember[];
      if (onlyEmail) {
        const s = await getDoc(doc(db, 'staff', onlyEmail));
        members = s.exists() ? [s.data() as StaffMember] : [];
      } else {
        const s = await getDocs(collection(db, 'staff'));
        members = s.docs.map((d) => d.data() as StaffMember).filter((x) => x.active);
      }

      const attSnap = onlyEmail
        ? await getDocs(query(collection(db, 'attendance'), where('email', '==', onlyEmail)))
        : await getDocs(query(collection(db, 'attendance'), where('date', '>=', start), where('date', '<=', end)));
      const att = attSnap.docs.map((d) => d.data() as AttendanceRecord).filter((r) => r.date >= start && r.date <= end);

      const hrSnap = onlyEmail
        ? await getDocs(query(collection(db, 'hrRequests'), where('email', '==', onlyEmail)))
        : await getDocs(collection(db, 'hrRequests'));
      const leaves = hrSnap.docs.map((d) => d.data() as HrRequest).filter((r) => r.type === 'leave' && r.status === 'approved');

      const advSnap = onlyEmail
        ? await getDocs(query(collection(db, 'advances'), where('email', '==', onlyEmail)))
        : await getDocs(query(collection(db, 'advances'), where('month', '==', month)));
      const adv = advSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Advance, 'id'>) })).filter((a) => a.month === month);

      const settings = await getDoc(doc(db, 'settings', 'payroll'));
      const gosi = settings.exists() ? Number(settings.data().gosiPercent) || 0 : 0;

      const rows = members.map((mem) =>
        computeSheet(
          mem,
          month,
          att.filter((r) => r.email === mem.email),
          leaves.filter((r) => r.email === mem.email),
          adv.filter((a) => a.email === mem.email),
          gosi,
        ),
      );
      rows.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      setState({ loading: false, rows, gosi, error: '' });
    } catch {
      setState((s) => ({ ...s, loading: false, error: 'تعذر تحميل البيانات.' }));
    }
  }, [month, onlyEmail]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
