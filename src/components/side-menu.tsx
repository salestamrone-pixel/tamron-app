import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { font, Icon, IconName, Logo, palette } from '@/components/kit';
import type { MainItem } from '@/components/kingdom';
import { useAuth } from '@/context/AuthContext';

function solid(name: IconName): IconName {
  const s = name.replace(/-outline$/, '') as IconName;
  return Ionicons.glyphMap[s] !== undefined ? s : name;
}

// Facebook-style side menu: opens from the logo, sections expand to show their items.
export function SideMenu({ visible, onClose, items }: { visible: boolean; onClose: () => void; items: MainItem[] }) {
  const insets = useSafeAreaInsets();
  const { user, staff } = useAuth();
  const [open, setOpen] = useState<string | null>(null);

  const run = (fn: () => void) => () => {
    onClose();
    fn();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.panel, { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <LinearGradient colors={['#0A0A0A', '#1C1910']} style={styles.head}>
            <Logo size={54} />
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.company}>شركة تامرون العربية المحدودة</Text>
              <Text style={styles.who}>{user ? `${user.displayName || user.email}${staff?.jobTitle ? ' · ' + staff.jobTitle : ''}` : 'زائر'}</Text>
            </View>
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
            {items.map((item) => {
              const expanded = open === item.key;
              const hasSubs = item.subs.length > 0;
              return (
                <View key={item.key}>
                  <Pressable
                    onPress={() => (hasSubs ? setOpen(expanded ? null : item.key) : item.onPress ? run(item.onPress)() : undefined)}
                    style={({ pressed }) => [styles.row, expanded && styles.rowOpen, pressed && { backgroundColor: palette.surface }]}>
                    <View style={[styles.icon, { backgroundColor: item.color }]}>
                      <Icon name={solid(item.icon)} size={22} color="#fff" />
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.label}>{item.label}</Text>
                      {item.subtitle ? <Text style={styles.sub}>{item.subtitle}</Text> : null}
                    </View>
                    {hasSubs ? <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={palette.muted} /> : <Icon name="chevron-back" size={20} color="#B9B4A6" />}
                  </Pressable>
                  {expanded ? (
                    <View style={styles.children}>
                      {item.subs.map((sub) => (
                        <Pressable key={sub.key} onPress={run(sub.onPress)} style={({ pressed }) => [styles.child, pressed && { backgroundColor: palette.surface }]}>
                          <View style={[styles.childIcon, { backgroundColor: sub.color + '22' }]}>
                            <Icon name={solid(sub.icon)} size={18} color={sub.color} />
                          </View>
                          <Text style={styles.childLabel}>{sub.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  panel: { width: '82%', maxWidth: 380, backgroundColor: '#fff', borderTopLeftRadius: 28, borderBottomLeftRadius: 28 },
  head: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginHorizontal: 12, padding: 14, borderRadius: 22 },
  company: { color: '#fff', fontSize: 15, fontFamily: font.black, textAlign: 'right' },
  who: { color: '#D9D2BC', fontSize: 11, fontFamily: font.regular, marginTop: 2, textAlign: 'right' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 18 },
  rowOpen: { backgroundColor: '#FBF7EE' },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 16, fontFamily: font.bold, color: palette.text },
  sub: { fontSize: 11, fontFamily: font.regular, color: palette.muted },
  children: { backgroundColor: '#FBF7EE', paddingBottom: 6 },
  child: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 8, paddingRight: 36, paddingLeft: 18 },
  childIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  childLabel: { fontSize: 14, fontFamily: font.medium, color: palette.text, flex: 1, textAlign: 'right' },
});
