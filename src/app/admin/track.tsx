import { Stack, useLocalSearchParams } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { Badge, Button, Card, Empty, Loading, Muted, palette, Row, Screen, Title } from '@/components/kit';
import { LiveMap } from '@/components/live-map';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { mapsUrl, todayKey } from '@/lib/geo';

interface TrackPoint {
  id: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  mocked: boolean;
  at: { toDate: () => Date; toMillis: () => number } | null;
}

function Track({ email, name }: { email: string; name: string }) {
  const [day, setDay] = useState(new Date());
  const date = todayKey(day);
  const [points, setPoints] = useState<TrackPoint[] | null>(null);

  useEffect(() => {
    setPoints(null);
    const q = query(collection(db, 'locations', email, 'points'), where('date', '==', date));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TrackPoint, 'id'>) }));
        list.sort((a, b) => (b.at?.toMillis() ?? 0) - (a.at?.toMillis() ?? 0));
        setPoints(list);
      },
      () => setPoints([]),
    );
  }, [email, date]);

  const shift = (days: number) => {
    const next = new Date(day);
    next.setDate(next.getDate() + days);
    if (next <= new Date()) setDay(next);
  };

  return (
    <Screen>
      <Card>
        <Title>{name}</Title>
        <Muted>{day.toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Muted>
        <Row>
          <Button label="اليوم السابق" variant="outline" onPress={() => shift(-1)} />
          <Button label="اليوم التالي" variant="outline" onPress={() => shift(1)} disabled={date === todayKey()} />
        </Row>
      </Card>

      {points && points.length > 0 ? (
        <LiveMap
          height={300}
          data={{
            route: [...points].reverse().map((p) => ({ lat: p.lat, lng: p.lng })),
            markers: [
              { lat: points[points.length - 1].lat, lng: points[points.length - 1].lng, color: '#16A34A', label: 'بداية اليوم' },
              { lat: points[0].lat, lng: points[0].lng, color: '#DC2626', label: 'آخر موقع' },
            ],
          }}
        />
      ) : null}
      {points === null ? <Loading /> : null}
      {points?.length === 0 ? (
        <Empty icon="location-outline" title="لا توجد تحركات مسجلة" message="لم يُسجَّل أي موقع لهذا الموظف في هذا اليوم. قد يكون التتبع متوقفاً على هاتفه." />
      ) : null}
      {points?.map((p) => (
        <Card key={p.id}>
          {p.mocked ? <Badge label="موقع وهمي (Fake GPS)" color={palette.danger} /> : null}
          <Title>{p.at ? p.at.toDate().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) : '—'}</Title>
          {p.accuracy ? <Muted>الدقة: ±{Math.round(p.accuracy)} متر</Muted> : null}
          <Button label="عرض على الخريطة" variant="outline" icon="map-outline" onPress={() => Linking.openURL(mapsUrl(p))} />
        </Card>
      ))}
    </Screen>
  );
}

export default function AdminTrack() {
  const { email, name } = useLocalSearchParams<{ email?: string; name?: string }>();
  return (
    <>
      <Stack.Screen options={{ title: 'سجل التحركات' }} />
      <StaffGate adminOnly>{email ? <Track email={email} name={name ?? email} /> : null}</StaffGate>
    </>
  );
}
