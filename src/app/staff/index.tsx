import { Stack, useRouter } from 'expo-router';
import { collection, doc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Badge, Button, Card, Dialog, ListItem, Muted, P, palette, Screen, Title } from '@/components/kit';
import { formatDate } from '@/components/quote-card';
import { StaffGate } from '@/components/staff-gate';
import { TrackingCard } from '@/components/tracking-card';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { getCurrentPoint, nearestSite, todayKey } from '@/lib/geo';
import { AttendanceRecord, StaffMember, WorkSite } from '@/types';

function formatTime(ts: { toDate: () => Date } | null | undefined) {
  if (!ts) return '—';
  return ts.toDate().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
}

function Portal({ staff }: { staff: StaffMember }) {
  const router = useRouter();
  const date = todayKey();
  const recordId = `${staff.email}_${date}`;
  const [today, setToday] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'attendance'), where('email', '==', staff.email));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AttendanceRecord, 'id'>) }));
      list.sort((a, b) => b.date.localeCompare(a.date));
      setToday(list.find((r) => r.id === recordId) ?? null);
      setHistory(list.filter((r) => r.id !== recordId).slice(0, 30));
    });
  }, [staff.email, recordId]);

  const punch = async (kind: 'in' | 'out') => {
    setBusy(true);
    try {
      const point = await getCurrentPoint();
      const sitesSnap = await getDocs(collection(db, 'sites'));
      const sites = sitesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkSite, 'id'>) }));
      const nearest = nearestSite(point, sites);
      if (!nearest) {
        setMessage({ title: 'لا توجد مواقع عمل', body: 'لم تضف الإدارة أي موقع عمل بعد.' });
        return;
      }
      if (nearest.distance > nearest.site.radius) {
        setMessage({
          title: 'أنت خارج موقع العمل',
          body: `أقرب موقع «${nearest.site.name}» يبعد عنك ${Math.round(nearest.distance)} متراً، والمسموح ${nearest.site.radius} متراً.`,
        });
        return;
      }
      const ref = doc(db, 'attendance', recordId);
      if (kind === 'in') {
        await setDoc(ref, {
          email: staff.email,
          name: staff.name,
          date,
          siteId: nearest.site.id,
          siteName: nearest.site.name,
          checkIn: serverTimestamp(),
          checkInLoc: point,
        });
      } else {
        await updateDoc(ref, { checkOut: serverTimestamp(), checkOutLoc: point });
      }
      await setDoc(doc(db, 'locations', staff.email), {
        email: staff.email,
        name: staff.name,
        ...point,
        updatedAt: serverTimestamp(),
      });
      setMessage({
        title: kind === 'in' ? 'تم تسجيل الحضور' : 'تم تسجيل الانصراف',
        body: `الموقع: ${nearest.site.name}`,
      });
    } catch (e: any) {
      setMessage({ title: 'تعذر التسجيل', body: e?.message ?? 'حاول مرة أخرى.' });
    } finally {
      setBusy(false);
    }
  };

  const checkedIn = today !== null;
  const checkedOut = !!today?.checkOut;

  return (
    <Screen>
      <Card>
        <Title>{staff.name}</Title>
        <Muted>{staff.jobTitle || 'موظف'} · {new Date().toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' })}</Muted>
      </Card>

      <Card>
        <Title>دوام اليوم</Title>
        {today ? (
          <>
            <Badge label={checkedOut ? 'انصرف' : 'حاضر'} color={checkedOut ? palette.muted : palette.success} />
            <P>الحضور: {formatTime(today.checkIn)} — {today.siteName}</P>
            <P>الانصراف: {formatTime(today.checkOut)}</P>
          </>
        ) : (
          <Muted>لم تسجل حضورك اليوم.</Muted>
        )}
        {!checkedIn ? <Button label="تسجيل الحضور" icon="location" variant="success" onPress={() => punch('in')} loading={busy} /> : null}
        {checkedIn && !checkedOut ? <Button label="تسجيل الانصراف" icon="exit-outline" variant="danger" onPress={() => punch('out')} loading={busy} /> : null}
        <Muted>يُسجَّل موقعك الجغرافي مع الحضور والانصراف ويظهر للإدارة.</Muted>
      </Card>

      <ListItem icon="calendar-outline" title="إجازاتي وأذوناتي" subtitle="تقديم طلب ومتابعة الرصيد والموافقات" onPress={() => router.push('/staff/requests')} />

      <TrackingCard staff={staff} />

      {history.length > 0 ? <Title>السجل السابق</Title> : null}
      {history.map((r) => (
        <Card key={r.id}>
          <P>{formatDate(r.checkIn) || r.date} — {r.siteName}</P>
          <Muted>حضور {formatTime(r.checkIn)} · انصراف {formatTime(r.checkOut)}</Muted>
        </Card>
      ))}

      <Dialog visible={message !== null} icon="navigate-circle-outline" title={message?.title ?? ''} message={message?.body} onClose={() => setMessage(null)}>
        <Button label="حسناً" onPress={() => setMessage(null)} />
      </Dialog>
    </Screen>
  );
}

export default function StaffScreen() {
  const { staff } = useAuth();
  return (
    <>
      <Stack.Screen options={{ title: 'بوابة الموظفين' }} />
      <StaffGate>{staff ? <Portal staff={staff} /> : null}</StaffGate>
    </>
  );
}
