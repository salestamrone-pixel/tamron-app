import { Stack } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { Badge, Button, Card, Muted, P, palette, Row, Screen, Title } from '@/components/kit';
import { formatDate } from '@/components/quote-card';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { mapsUrl, todayKey } from '@/lib/geo';
import { AttendanceRecord, StaffMember } from '@/types';

interface LastLocation {
  email: string;
  name: string;
  lat: number;
  lng: number;
  updatedAt: { toDate: () => Date } | null;
}

function time(ts: { toDate: () => Date } | null | undefined) {
  if (!ts) return '—';
  return ts.toDate().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
}

function Attendance() {
  const [day, setDay] = useState(new Date());
  const date = todayKey(day);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [locations, setLocations] = useState<Record<string, LastLocation>>({});

  useEffect(() => {
    return onSnapshot(query(collection(db, 'attendance'), where('date', '==', date)), (snap) =>
      setRecords(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AttendanceRecord, 'id'>) }))),
    );
  }, [date]);

  useEffect(() => {
    const offStaff = onSnapshot(collection(db, 'staff'), (snap) =>
      setStaff(snap.docs.map((d) => d.data() as StaffMember).filter((s) => s.active)),
    );
    const offLoc = onSnapshot(collection(db, 'locations'), (snap) => {
      const map: Record<string, LastLocation> = {};
      snap.docs.forEach((d) => (map[d.id] = d.data() as LastLocation));
      setLocations(map);
    });
    return () => {
      offStaff();
      offLoc();
    };
  }, []);

  const shift = (days: number) => {
    const next = new Date(day);
    next.setDate(next.getDate() + days);
    if (next <= new Date()) setDay(next);
  };

  const byEmail = new Map(records.map((r) => [r.email, r]));

  return (
    <Screen>
      <Card>
        <Title>{day.toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Title>
        <Muted>حاضر {records.length} من {staff.length}</Muted>
        <Row>
          <Button label="اليوم السابق" variant="outline" onPress={() => shift(-1)} />
          <Button label="اليوم التالي" variant="outline" onPress={() => shift(1)} disabled={date === todayKey()} />
        </Row>
      </Card>

      {staff.map((member) => {
        const record = byEmail.get(member.email);
        const last = locations[member.email];
        return (
          <Card key={member.email}>
            <Badge
              label={!record ? 'غائب' : record.checkOut ? 'انصرف' : 'حاضر'}
              color={!record ? palette.danger : record.checkOut ? palette.muted : palette.success}
            />
            <Title>{member.name}</Title>
            {record ? (
              <P>حضور {time(record.checkIn)} · انصراف {time(record.checkOut)} — {record.siteName}</P>
            ) : null}
            {last ? (
              <>
                <Muted>آخر موقع مسجل: {formatDate(last.updatedAt, true)}</Muted>
                <Button label="عرض آخر موقع على الخريطة" variant="outline" onPress={() => Linking.openURL(mapsUrl(last))} />
              </>
            ) : (
              <Muted>لا يوجد موقع مسجل.</Muted>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}

export default function AdminAttendance() {
  return (
    <>
      <Stack.Screen options={{ title: 'الحضور والانصراف' }} />
      <StaffGate adminOnly>
        <Attendance />
      </StaffGate>
    </>
  );
}
