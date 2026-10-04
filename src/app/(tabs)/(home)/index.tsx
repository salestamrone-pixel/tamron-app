import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Muted, palette, Screen, Title } from '@/components/kit';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isStaff, isAdmin } = useAuth();

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>تامرون العربية</Text>
        <Text style={styles.heroText}>دعاية وإعلان · لوحات وواجهات · ليزر و CNC</Text>
      </View>

      <Card onPress={() => router.push('/services')}>
        <Title>اطلب عرض سعر</Title>
        <Muted>اختر الخدمة واكتب المواصفات، وسنرد عليك بالسعر.</Muted>
      </Card>

      <Card onPress={() => router.push('/portfolio')}>
        <Title>معرض الأعمال</Title>
        <Muted>نماذج من أعمالنا السابقة.</Muted>
      </Card>

      {isStaff ? (
        <Card onPress={() => router.push('/staff')} style={styles.staffCard}>
          <Title>بوابة الموظفين</Title>
          <Muted>تسجيل الحضور والانصراف وسجل دوامك.</Muted>
        </Card>
      ) : null}

      {isAdmin ? (
        <Card onPress={() => router.push('/admin')} style={styles.staffCard}>
          <Title>لوحة الإدارة</Title>
          <Muted>طلبات العملاء، الموظفون، مواقع العمل، والحضور.</Muted>
        </Card>
      ) : null}

      {!user ? (
        <Card onPress={() => router.push('/auth/login')}>
          <Title>تسجيل الدخول</Title>
          <Muted>سجّل الدخول لإرسال الطلبات ومتابعتها.</Muted>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: palette.primary,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '800' },
  heroText: { color: '#cfe0f0', fontSize: 14, textAlign: 'center' },
  staffCard: { borderRightWidth: 4, borderRightColor: palette.accent },
});
