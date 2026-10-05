import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { font, Icon, Logo } from '@/components/kit';
import { MainItem, MainMenu } from '@/components/kingdom';
import { SERVICES } from '@/constants/services';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isStaff, isAdmin } = useAuth();
  const go = (path: string) => () => router.push(path as never);
  const firstName = user?.displayName?.split(' ')[0];

  const items: MainItem[] = [
    {
      key: 'services',
      label: 'خدماتنا',
      icon: 'grid-outline',
      color: '#F59E0B',
      subs: SERVICES.map((s) => ({
        key: s.id,
        label: s.name,
        icon: s.icon,
        color: s.color,
        onPress: () => router.push({ pathname: '/request', params: { serviceId: s.id } }),
      })),
    },
    {
      key: 'work',
      label: 'أعمالنا',
      icon: 'images-outline',
      color: '#EC4899',
      subs: [
        { key: 'portfolio', label: 'معرض الأعمال', icon: 'images-outline', color: '#EC4899', onPress: go('/portfolio') },
        { key: 'orders', label: 'طلباتي', icon: 'document-text-outline', color: '#3B82F6', onPress: go('/orders') },
      ],
    },
  ];

  if (isStaff || isAdmin) {
    const subs: MainItem['subs'] = [];
    if (isStaff) {
      subs.push({ key: 'staff', label: 'الحضور والانصراف', icon: 'location-outline', color: '#14B8A6', onPress: go('/staff') });
      subs.push({ key: 'leave', label: 'إجازاتي وأذوناتي', icon: 'calendar-outline', color: '#F59E0B', onPress: go('/staff/requests') });
    }
    if (isAdmin) {
      subs.push({ key: 'admin', label: 'لوحة الإدارة', icon: 'shield-checkmark-outline', color: '#7C5CFF', onPress: go('/admin') });
      subs.push({ key: 'att', label: 'سجل الحضور', icon: 'calendar-number-outline', color: '#22C55E', onPress: go('/admin/attendance') });
      subs.push({ key: 'hr', label: 'طلبات الإجازات', icon: 'documents-outline', color: '#F97316', onPress: go('/admin/hr') });
      subs.push({ key: 'emp', label: 'الموظفون', icon: 'people-outline', color: '#06B6D4', onPress: go('/admin/employees') });
      subs.push({ key: 'sites', label: 'مواقع العمل', icon: 'navigate-circle-outline', color: '#3B82F6', onPress: go('/admin/sites') });
      subs.push({ key: 'quotes', label: 'طلبات العملاء', icon: 'chatbubbles-outline', color: '#FF6B4A', onPress: go('/admin/requests') });
    }
    items.push({ key: 'team', label: 'فريقنا', icon: 'people-outline', color: '#14B8A6', subs });
  }

  items.push({
    key: 'me',
    label: 'حسابي',
    icon: 'person-outline',
    color: '#3B82F6',
    subs: user
      ? [{ key: 'profile', label: 'ملفي', icon: 'person-circle-outline', color: '#3B82F6', onPress: go('/profile') }]
      : [
          { key: 'login', label: 'تسجيل الدخول', icon: 'log-in-outline', color: '#3B82F6', onPress: go('/auth/login') },
          { key: 'register', label: 'حساب جديد', icon: 'person-add-outline', color: '#22C55E', onPress: go('/auth/register') },
        ],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Image source={require('@/assets/images/home-bg.jpg')} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(5,8,22,0.45)', 'rgba(5,8,22,0)', 'rgba(5,8,22,0.15)', 'rgba(5,8,22,0.8)']}
        locations={[0, 0.3, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Logo size={52} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.title}>{firstName ? `أهلاً ${firstName}` : 'تامرون العربية'}</Text>
              <Text style={styles.subtitle}>دعاية وإعلان · لوحات وواجهات · ليزر و CNC</Text>
            </View>
          </View>
          <View style={styles.spacer} />
          <MainMenu items={items} />
          <Pressable onPress={() => router.push('/services')} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.7 }]}>
            <Text style={styles.ctaText}>اطلب عرض سعر</Text>
            <Icon name="arrow-back" size={20} color="#fff" />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050816' },
  content: { padding: 18, gap: 16, paddingBottom: 130, width: '100%', maxWidth: 720, alignSelf: 'center' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  title: { color: '#fff', fontSize: 24, fontFamily: font.black, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  subtitle: { color: '#EFE6CC', fontSize: 12, fontFamily: font.medium, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  spacer: { height: 340 },
  cta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  ctaText: { color: '#fff', fontSize: 16, fontFamily: font.bold },
});
