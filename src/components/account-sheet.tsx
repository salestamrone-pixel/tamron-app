import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { font, Icon, IconName, palette } from '@/components/kit';
import { useAuth } from '@/context/AuthContext';

interface Row {
  key: string;
  label: string;
  icon: IconName;
  color: string;
  danger?: boolean;
  onPress: () => void;
}

// WhatsApp/Facebook-style bottom sheet that opens when the account tab is tapped.
export function AccountSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, staff, isStaff, isAdmin, logout } = useAuth();

  const go = (path: string) => () => {
    onClose();
    router.push(path as never);
  };

  const rows: Row[] = [];
  if (user) {
    rows.push({ key: 'profile', label: 'ملفي الشخصي', icon: 'person-circle', color: '#3B82F6', onPress: go('/profile') });
    rows.push({ key: 'orders', label: 'طلباتي', icon: 'document-text', color: '#F59E0B', onPress: go('/orders') });
    if (isStaff) {
      rows.push({ key: 'staff', label: 'الحضور والانصراف', icon: 'location', color: '#14B8A6', onPress: go('/staff') });
      rows.push({ key: 'leave', label: 'إجازاتي وأذوناتي', icon: 'calendar', color: '#F97316', onPress: go('/staff/requests') });
    }
    if (isAdmin) {
      rows.push({ key: 'admin', label: 'لوحة الإدارة', icon: 'shield-checkmark', color: '#7C5CFF', onPress: go('/admin') });
    }
    rows.push({
      key: 'logout',
      label: 'تسجيل الخروج',
      icon: 'log-out',
      color: palette.danger,
      danger: true,
      onPress: () => {
        onClose();
        logout();
      },
    });
  } else {
    rows.push({ key: 'login', label: 'تسجيل الدخول', icon: 'log-in', color: '#3B82F6', onPress: go('/auth/login') });
    rows.push({ key: 'register', label: 'إنشاء حساب جديد', icon: 'person-add', color: '#22C55E', onPress: go('/auth/register') });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <View style={styles.avatar}>
              <Icon name="person" size={26} color="#fff" />
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.name}>{user ? user.displayName || 'مستخدم' : 'زائر'}</Text>
              <Text style={styles.sub}>{user ? staff?.jobTitle || user.email : 'سجّل الدخول للمتابعة'}</Text>
            </View>
          </View>
          {rows.map((r) => (
            <Pressable key={r.key} onPress={r.onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: palette.surface }]}>
              <View style={[styles.rowIcon, { backgroundColor: r.color + '1F' }]}>
                <Icon name={r.icon} size={22} color={r.color} />
              </View>
              <Text style={[styles.rowLabel, r.danger && { color: palette.danger }]}>{r.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 16, paddingTop: 10 },
  handle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: '#D9D5C8', marginBottom: 12 },
  head: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 8, marginBottom: 6 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 17, fontFamily: font.black, color: palette.text },
  sub: { fontSize: 12, fontFamily: font.regular, color: palette.muted },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14, paddingVertical: 11, paddingHorizontal: 8, borderRadius: 16 },
  rowIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 16, fontFamily: font.bold, color: palette.text },
});
