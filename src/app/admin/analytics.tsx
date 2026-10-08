import { Stack } from 'expo-router';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Card, Empty, font, Loading, Muted, palette, Screen, Section, Title } from '@/components/kit';
import { formatDate } from '@/components/quote-card';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { UserRecord } from '@/types';

const REPO = 'salestamrone-pixel/tamron-app';

interface Summary {
  totalOpens: number;
  uniqueDevices: number;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  customer: { label: 'عميل', color: '#1D4ED8' },
  employee: { label: 'موظف', color: '#059669' },
  hr: { label: 'موارد بشرية', color: '#7C3AED' },
  admin: { label: 'إدارة', color: '#D97706' },
};

function useDownloadCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`);
        if (!res.ok) throw new Error();
        const releases: { assets: { name: string; download_count: number }[] }[] = await res.json();
        const total = releases
          .flatMap((r) => r.assets)
          .filter((a) => a.name === 'tamron-app.apk')
          .reduce((sum, a) => sum + a.download_count, 0);
        if (active) setCount(total);
      } catch {
        if (active) setCount(null);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return count;
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AnalyticsBody() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [users, setUsers] = useState<UserRecord[] | null>(null);
  const downloads = useDownloadCount();

  useEffect(() => {
    return onSnapshot(doc(db, 'analytics', 'summary'), (snap) => {
      const data = snap.data();
      setSummary({ totalOpens: data?.totalOpens ?? 0, uniqueDevices: data?.uniqueDevices ?? 0 });
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('lastLoginAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UserRecord, 'id'>) }))),
      () => setUsers([]),
    );
  }, []);

  return (
    <>
      <Section>نظرة عامة</Section>
      <View style={styles.statsRow}>
        <Stat label="مرات فتح التطبيق" value={summary?.totalOpens ?? '—'} />
        <Stat label="أجهزة مختلفة" value={summary?.uniqueDevices ?? '—'} />
        <Stat label="مرات تحميل الـ APK" value={downloads ?? '—'} />
      </View>
      <Muted>عدد مرات التحميل مأخوذ من GitHub Releases، وهو مصدر توزيع التطبيق الحالي قبل النشر على Google Play.</Muted>

      <Section>من سجّل الدخول ({users?.length ?? 0})</Section>
      {users === null ? (
        <Loading />
      ) : users.length === 0 ? (
        <Empty icon="people-outline" title="لا يوجد مستخدمون بعد" message="ستظهر هنا كل حسابات العملاء والموظفين فور أول تسجيل دخول." />
      ) : (
        users.map((u) => {
          const role = ROLE_LABELS[u.role] ?? { label: u.role, color: '#6B7280' };
          return (
            <Card key={u.id} style={styles.userCard}>
              <View style={styles.userHead}>
                <Badge label={role.label} color={role.color} />
                <Title>{u.name || 'بدون اسم'}</Title>
              </View>
              <Muted>{u.email}</Muted>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{u.platform === 'android' ? 'أندرويد' : u.platform === 'ios' ? 'آيفون' : u.platform}</Text>
                {u.deviceModel ? <Text style={styles.meta}>· {u.deviceModel}</Text> : null}
                {u.appBuild ? <Text style={styles.meta}>· نسخة {u.appBuild}</Text> : null}
                <Text style={styles.meta}>· {u.emailVerified ? 'بريد موثّق' : 'بريد غير موثّق'}</Text>
              </View>
              <Muted>أول دخول: {formatDate(u.createdAt, true) || '—'} · آخر دخول: {formatDate(u.lastLoginAt, true) || '—'}</Muted>
            </Card>
          );
        })
      )}
    </>
  );
}

export default function AdminAnalytics() {
  return (
    <>
      <Stack.Screen options={{ title: 'الزوار والمستخدمون' }} />
      <StaffGate adminOnly>
        <Screen>
          <AnalyticsBody />
        </Screen>
      </StaffGate>
    </>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 },
  stat: { flexGrow: 1, flexBasis: '30%', backgroundColor: '#fff', borderRadius: 18, padding: 14, alignItems: 'center', gap: 2, boxShadow: '0 6px 16px rgba(10,10,10,0.06)' },
  statValue: { fontSize: 22, fontFamily: font.black, color: palette.text },
  statLabel: { fontSize: 11, fontFamily: font.medium, color: palette.muted, textAlign: 'center' },
  userCard: { gap: 4 },
  userHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  metaRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 4 },
  meta: { fontSize: 12, fontFamily: font.medium, color: palette.muted },
});
