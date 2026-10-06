import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { font, Icon, Logo } from '@/components/kit';
import { MainItem, MainMenu } from '@/components/kingdom';
import { SideMenu } from '@/components/side-menu';
import { SERVICES } from '@/constants/services';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isStaff, isAdmin } = useAuth();
  const go = (path: string) => () => router.push(path as never);
  const firstName = user?.displayName?.split(' ')[0];

  const items: MainItem[] = [
    {
      key: 'services',
      label: 'خدماتنا',
      subtitle: `${SERVICES.length} خدمة`,
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
      key: 'store',
      label: 'متجرنا',
      subtitle: 'منتجاتنا وأعمالنا',
      icon: 'storefront-outline',
      color: '#EF4444',
      subs: [],
      onPress: go('/store'),
    },
    {
      key: 'work',
      label: 'أعمالنا',
      subtitle: 'معرض وطلباتك',
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
      subs.push({ key: 'shop', label: 'إدارة المتجر', icon: 'storefront-outline', color: '#EC4899', onPress: go('/admin/store') });
      subs.push({ key: 'quotes', label: 'طلبات العملاء', icon: 'chatbubbles-outline', color: '#FF6B4A', onPress: go('/admin/requests') });
    }
    items.push({ key: 'team', label: 'فريقنا', subtitle: 'للموظفين والإدارة', icon: 'people-outline', color: '#14B8A6', subs });
  }

  items.push({
    key: 'about',
    label: 'من نحن',
    subtitle: 'تعرّف علينا',
    icon: 'information-circle-outline',
    color: '#A855F7',
    subs: [],
    onPress: go('/about'),
  });

  items.push({
    key: 'me',
    label: 'حسابي',
    subtitle: 'ملفك وخياراتك',
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
        colors={['rgba(46,22,4,0.35)', 'rgba(255,170,70,0.05)', 'rgba(255,150,50,0.12)', 'rgba(38,16,3,0.78)']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => setMenuOpen(true)} hitSlop={10}>
              <Logo size={52} />
              <View style={styles.menuBadge}>
                <Icon name="menu" size={12} color="#0A0A0A" />
              </View>
            </Pressable>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.title}>شركة تامرون العربية المحدودة</Text>
              <Text style={styles.subtitle}>{firstName ? `أهلاً ${firstName} · ` : ''}دعاية وإعلان · لوحات وواجهات · ليزر و CNC</Text>
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
      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} items={items} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A0D03' },
  content: { padding: 18, gap: 16, paddingBottom: 28, width: '100%', maxWidth: 720, alignSelf: 'center' },
  menuBadge: { position: 'absolute', right: -4, bottom: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#EDD85D', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  title: { color: '#fff', fontSize: 20, fontFamily: font.black, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  subtitle: { color: '#EFE6CC', fontSize: 12, fontFamily: font.medium, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  spacer: { height: 220 },
  cta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: 'rgba(255,196,100,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,220,150,0.55)',
  },
  ctaText: { color: '#fff', fontSize: 16, fontFamily: font.bold },
});
