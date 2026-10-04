import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Grid, Hero, ListItem, palette, Screen, Section, Tile } from '@/components/kit';
import { SERVICES } from '@/constants/services';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isStaff, isAdmin } = useAuth();
  const firstName = user?.displayName?.split(' ')[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={['top']}>
      <Screen>
        <Hero
          logo
          title={firstName ? `أهلاً ${firstName}` : 'تامرون العربية'}
          subtitle="دعاية وإعلان · لوحات وواجهات · ليزر و CNC. اكتب مواصفات طلبك ونرد عليك بعرض السعر.">
          <View style={{ alignSelf: 'stretch', marginTop: 8 }}>
            <Button label="اطلب عرض سعر" icon="arrow-left" onPress={() => router.push('/services')} />
          </View>
        </Hero>

        {isStaff || isAdmin ? <Section>فريق العمل</Section> : null}
        {isStaff ? (
          <ListItem icon="map-marker-check-outline" title="بوابة الموظفين" subtitle="الحضور والانصراف وسجل الدوام" onPress={() => router.push('/staff')} />
        ) : null}
        {isAdmin ? (
          <ListItem icon="shield-crown-outline" title="لوحة الإدارة" subtitle="الطلبات، الموظفون، المواقع، الحضور" onPress={() => router.push('/admin')} />
        ) : null}

        <Section>خدماتنا</Section>
        <Grid>
          {SERVICES.slice(0, 6).map((s) => (
            <Tile key={s.id} icon={s.icon} title={s.name} onPress={() => router.push({ pathname: '/request', params: { serviceId: s.id } })} />
          ))}
        </Grid>
        <Button label="كل الخدمات" variant="outline" icon="arrow-left" onPress={() => router.push('/services')} />

        <ListItem icon="image-multiple-outline" title="معرض الأعمال" subtitle="نماذج من أعمالنا السابقة" onPress={() => router.push('/portfolio')} />

        {!user ? (
          <ListItem icon="login" title="تسجيل الدخول" subtitle="لإرسال الطلبات ومتابعة رد الشركة" onPress={() => router.push('/auth/login')} />
        ) : null}
      </Screen>
    </SafeAreaView>
  );
}
