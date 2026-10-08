import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { font, Icon, palette } from '@/components/kit';
import { checkForUpdate, UpdateInfo } from '@/lib/update-check';

const DISMISS_KEY = 'tamron:update-dismissed-build';

// A static, user-dismissible notice — no auto-popup, no motion. The app isn't on
// Google Play yet, so this is the only way a user finds out a newer build exists.
export function UpdateBanner() {
  const [info, setInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let active = true;
    (async () => {
      const update = await checkForUpdate();
      if (!update || !active) return;
      const dismissed = Number((await AsyncStorage.getItem(DISMISS_KEY)) ?? 0);
      if (update.build > dismissed) setInfo(update);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!info) return null;

  const dismiss = () => {
    AsyncStorage.setItem(DISMISS_KEY, String(info.build)).catch(() => {});
    setInfo(null);
  };

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.body} onPress={() => Linking.openURL(info.downloadUrl)}>
        <Icon name="arrow-down-circle-outline" size={22} color={palette.goldLight} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>تحديث جديد متاح</Text>
          <Text style={styles.subtitle}>اضغط لتحميل أحدث نسخة من التطبيق</Text>
        </View>
      </Pressable>
      <Pressable hitSlop={10} onPress={dismiss}>
        <Icon name="close" size={18} color="#D9C78F" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    padding: 12,
    backgroundColor: 'rgba(204,167,65,0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(204,167,65,0.55)',
  },
  body: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  title: { fontSize: 14, fontFamily: font.bold, color: '#fff', textAlign: 'right' },
  subtitle: { fontSize: 12, fontFamily: font.medium, color: '#D9C78F', textAlign: 'right' },
});
