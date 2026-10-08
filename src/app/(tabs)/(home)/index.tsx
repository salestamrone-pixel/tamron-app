import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { font, Icon, Logo, palette } from '@/components/kit';
import { MainMenu } from '@/components/kingdom';
import { useAuth } from '@/context/AuthContext';
import { openMenu } from '@/lib/menu-store';
import { useMenuItems } from '@/lib/use-menu-items';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const items = useMenuItems();
  const firstName = user?.displayName?.split(' ')[0];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Image source={require('@/assets/images/home-bg.jpg')} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(10,10,10,0.5)', 'rgba(10,10,10,0)', 'rgba(10,10,10,0.08)', 'rgba(10,10,10,0.5)']}
        locations={[0, 0.25, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={openMenu} hitSlop={10} style={({ pressed }) => pressed && { opacity: 0.8 }}>
              <Logo size={54} />
            </Pressable>
            {firstName ? (
              <View style={styles.hello}>
                <Text style={styles.helloText}>أهلاً {firstName}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.spacer} />
          <MainMenu items={items} onOpenSection={(key) => router.push({ pathname: '/section', params: { key } } as never)} />
          <Pressable onPress={() => router.push('/services')} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.7 }]}>
            <Text style={styles.ctaText}>اطلب عرض سعر</Text>
            <Icon name="arrow-back" size={20} color={palette.goldLight} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink },
  content: { padding: 18, gap: 16, paddingBottom: 28, width: '100%', maxWidth: 720, alignSelf: 'center' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  hello: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(10,10,10,0.55)', borderWidth: 1, borderColor: 'rgba(204,167,65,0.6)' },
  helloText: { color: '#fff', fontSize: 13, fontFamily: font.bold },
  spacer: { height: 220 },
  cta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: 'rgba(10,10,10,0.55)',
    borderWidth: 1.5,
    borderColor: palette.gold,
  },
  ctaText: { color: palette.goldLight, fontSize: 16, fontFamily: font.bold, flexShrink: 0 },
});
