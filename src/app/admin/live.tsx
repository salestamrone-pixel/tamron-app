import { Stack, useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';

import { Badge, Button, Card, Empty, Loading, Muted, palette, Screen, Title } from '@/components/kit';
import { LiveMap } from '@/components/live-map';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { mapsUrl } from '@/lib/geo';

interface Live {
  email: string;
  name: string;
  lat: number;
  lng: number;
  updatedAt: { toMillis: () => number } | null;
}

function freshness(ms: number | undefined, now: number) {
  if (!ms) return { label: 'لا يوجد تحديث', color: palette.danger, text: '—' };
  const min = Math.max(0, Math.round((now - ms) / 60000));
  const text = min < 1 ? 'الآن' : min < 60 ? `منذ ${min} دقيقة` : min < 1440 ? `منذ ${Math.round(min / 60)} ساعة` : `منذ ${Math.round(min / 1440)} يوم`;
  if (min <= 15) return { label: 'متصل', color: palette.success, text };
  if (min <= 60) return { label: 'تحديث متأخر', color: '#F59E0B', text };
  return { label: 'التتبع متوقف', color: palette.danger, text };
}

function LiveBoard() {
  const router = useRouter();
  const [list, setList] = useState<Live[] | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    const unsub = onSnapshot(
      collection(db, 'locations'),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as Live);
        items.sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0));
        setList(items);
      },
      () => setList([]),
    );
    return () => {
      clearInterval(t);
      unsub();
    };
  }, []);

  const data = useMemo(
    () => ({
      markers: (list ?? [])
        .filter((l) => typeof l.lat === 'number')
        .map((l) => {
          const f = freshness(l.updatedAt?.toMillis(), now);
          return { lat: l.lat, lng: l.lng, color: f.color, label: `${l.name} — ${f.text}` };
        }),
    }),
    [list, now],
  );

  if (list === null) return <Loading />;
  if (list.length === 0) return <Empty icon="location-outline" title="لا توجد مواقع بعد" message="تظهر مواقع الموظفين هنا بعد تفعيلهم التتبع من بوابة الموظفين." />;

  return (
    <Screen>
      <LiveMap data={data} height={340} />
      <Muted>أخضر: متصل (آخر 15 دقيقة) · برتقالي: متأخر · أحمر: التتبع متوقف. تتحدث الأسماء والألوان تلقائياً.</Muted>
      {list.map((l) => {
        const f = freshness(l.updatedAt?.toMillis(), now);
        return (
          <Card key={l.email}>
            <Badge label={f.label} color={f.color} />
            <Title>{l.name}</Title>
            <Muted>آخر موقع: {f.text}</Muted>
            <Button label="مسار اليوم" variant="outline" icon="trail-sign-outline" onPress={() => router.push({ pathname: '/admin/track', params: { email: l.email, name: l.name } } as never)} />
            <Button label="فتح في خرائط جوجل" variant="outline" icon="map-outline" onPress={() => Linking.openURL(mapsUrl(l))} />
          </Card>
        );
      })}
    </Screen>
  );
}

export default function AdminLive() {
  return (
    <>
      <Stack.Screen options={{ title: 'التتبع المباشر' }} />
      <StaffGate adminOnly>
        <LiveBoard />
      </StaffGate>
    </>
  );
}
