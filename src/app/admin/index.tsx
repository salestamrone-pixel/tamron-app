import { Stack, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, font, Grid, Hero, Muted, palette, Screen, Section, Tile, Title } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { todayKey } from '@/lib/geo';
import { StaffMember } from '@/types';

interface Stats {
  newQuotes: number | null;
  pendingHr: number;
  presentToday: number;
  staffCount: number;
  alerts: { key: string; text: string; expired: boolean }[];
}

const daysUntil = (date?: string) => (date ? Math.ceil((new Date(`${date}T00:00:00`).getTime() - Date.now()) / 86400000) : null);

function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const safe = async <T,>(fn: () => Promise<T>, fallback: T) => {
        try {
          return await fn();
        } catch {
          return fallback;
        }
      };
      const newQuotes = isAdmin
        ? await safe(async () => (await getDocs(query(collection(db, 'quoteRequests'), where('status', '==', 'new')))).size, 0)
        : null;
      const pendingHr = await safe(async () => (await getDocs(query(collection(db, 'hrRequests'), where('status', '==', 'pending')))).size, 0);
      const presentToday = await safe(async () => (await getDocs(query(collection(db, 'attendance'), where('date', '==', todayKey())))).size, 0);
      const staff = await safe(async () => (await getDocs(collection(db, 'staff'))).docs.map((d) => d.data() as StaffMember).filter((s) => s.active), [] as StaffMember[]);
      const alerts: Stats['alerts'] = [];
      for (const s of staff) {
        for (const [label, date] of [['الهوية/الإقامة', s.idExpiry], ['العقد', s.contractEnd]] as const) {
          const left = daysUntil(date);
          if (left !== null && left <= 60) {
            alerts.push({ key: `${s.email}-${label}`, expired: left < 0, text: `${s.name}: ${label} ${left < 0 ? `منتهية منذ ${-left} يوم` : `تنتهي بعد ${left} يوم`}` });
          }
        }
      }
      setStats({ newQuotes, pendingHr, presentToday, staffCount: staff.length, alerts });
    })();
  }, [isAdmin]);

  if (!stats) return null;
  const box = (label: string, value: number) => (
    <View style={styles.box} key={label}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.boxLabel}>{label}</Text>
    </View>
  );
  return (
    <>
      <View style={styles.boxes}>
        {stats.newQuotes !== null ? box('طلبات جديدة', stats.newQuotes) : null}
        {box('إجازات معلقة', stats.pendingHr)}
        {box('حاضرون اليوم', stats.presentToday)}
        {box('الموظفون', stats.staffCount)}
      </View>
      {stats.alerts.length > 0 ? (
        <Card>
          <Title>تنبيهات تحتاج متابعة</Title>
          {stats.alerts.map((a) => (
            <Text key={a.key} style={[styles.alert, a.expired && { color: palette.danger }]}>{a.text}</Text>
          ))}
        </Card>
      ) : (
        <Muted>لا توجد وثائق قريبة الانتهاء خلال 60 يوماً.</Muted>
      )}
    </>
  );
}

export default function AdminHome() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const go = (path: string) => () => router.push(path as never);
  return (
    <>
      <Stack.Screen options={{ title: 'لوحة الإدارة' }} />
      <StaffGate manager>
        <Screen>
          <Hero icon="shield-checkmark-outline" title="لوحة الإدارة" subtitle="الأرقام والتنبيهات وكل أدوات الشركة في مكان واحد." />
          <Dashboard />
          <Section>الموارد البشرية</Section>
          <Grid>
            <Tile icon="calendar-outline" color="#14B8A6" title="الحضور والانصراف" onPress={go('/admin/attendance')} />
            <Tile icon="calendar-number-outline" color="#F59E0B" title="الإجازات والأذونات" onPress={go('/admin/hr')} />
            <Tile icon="cash-outline" color="#22C55E" title="الرواتب والخصومات" onPress={go('/admin/payroll')} />
            <Tile icon="stats-chart-outline" color="#06B6D4" title="تقرير الحضور" onPress={go('/admin/report')} />
            <Tile icon="checkbox-outline" color="#8B5CF6" title="مهام التنفيذ" onPress={go('/admin/tasks')} />
          </Grid>
          {isAdmin ? (
            <>
              <Section>الإدارة</Section>
              <Grid>
                <Tile icon="document-text-outline" color="#FF6B4A" title="طلبات العملاء" onPress={go('/admin/requests')} />
                <Tile icon="storefront-outline" color="#EC4899" title="إدارة المتجر" onPress={go('/admin/store')} />
                <Tile icon="radio-outline" color="#EF4444" title="التتبع المباشر" onPress={go('/admin/live')} />
                <Tile icon="people-outline" color="#7C5CFF" title="الموظفون" onPress={go('/admin/employees')} />
                <Tile icon="navigate-circle-outline" color="#3B82F6" title="مواقع العمل" onPress={go('/admin/sites')} />
                <Tile icon="shield-checkmark-outline" color="#475569" title="سجل العمليات" onPress={go('/admin/audit')} />
                <Tile icon="analytics-outline" color="#0EA5E9" title="الزوار والمستخدمون" onPress={go('/admin/analytics')} />
              </Grid>
            </>
          ) : null}
        </Screen>
      </StaffGate>
    </>
  );
}

const styles = StyleSheet.create({
  boxes: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 },
  box: { flexGrow: 1, flexBasis: '22%', backgroundColor: '#fff', borderRadius: 18, padding: 12, alignItems: 'center', gap: 2, boxShadow: '0 6px 16px rgba(10,10,10,0.06)' },
  value: { fontSize: 24, fontFamily: font.black, color: palette.text },
  boxLabel: { fontSize: 11, fontFamily: font.medium, color: palette.muted, textAlign: 'center' },
  alert: { fontSize: 13, fontFamily: font.medium, color: '#B45309', textAlign: 'right', lineHeight: 22 },
});
