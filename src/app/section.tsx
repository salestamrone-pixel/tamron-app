import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { palette } from '@/components/kit';
import { SubGrid } from '@/components/kingdom';
import { useMenuItems } from '@/lib/use-menu-items';

// A page of its own for one main icon: its sub-icons laid out over the same skyline photo.
export default function SectionScreen() {
  const { key } = useLocalSearchParams<{ key?: string }>();
  const item = useMenuItems().find((i) => i.key === key);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: item?.label ?? '' }} />
      <Image source={require('@/assets/images/home-bg.jpg')} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
      <LinearGradient colors={['rgba(10,10,10,0.4)', 'rgba(10,10,10,0.12)', 'rgba(10,10,10,0.5)']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content}>{item ? <SubGrid subs={item.subs} /> : null}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink },
  content: { padding: 18, paddingBottom: 40, width: '100%', maxWidth: 720, alignSelf: 'center' },
});
