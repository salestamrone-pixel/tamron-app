import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { font, Icon, IconName, Logo } from '@/components/kit';
import type { MainItem } from '@/components/kingdom';
import { useAuth } from '@/context/AuthContext';

function solid(name: IconName): IconName {
  const s = name.replace(/-outline$/, '') as IconName;
  return Ionicons.glyphMap[s] !== undefined ? s : name;
}

const sheet = '#2B2B2E';
const card = '#000000';
const line = '#2B2B2E';
const textMain = '#F4F4F5';
const textDim = '#A1A1AA';

// Google-style account sheet: dark rounded cards. It slides out of the logo's corner (top right)
// and the header card (logo + company name) unfolds a moment later.
export function SideMenu({ visible, onClose, items }: { visible: boolean; onClose: () => void; items: MainItem[] }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, staff } = useAuth();
  const [open, setOpen] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const slide = useRef(new Animated.Value(0)).current;
  const unfold = useRef(new Animated.Value(0)).current;
  const panelWidth = Math.min(width * 0.92, 420);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      slide.setValue(0);
      unfold.setValue(0);
      Animated.sequence([
        Animated.timing(slide, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(unfold, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.timing(slide, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => setMounted(false));
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = (fn: () => void) => () => {
    onClose();
    fn();
  };

  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [panelWidth, 0] });
  const scale = slide.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const nameX = unfold.interpolate({ inputRange: [0, 1], outputRange: [60, 0] });

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: slide }]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.panel,
            { width: panelWidth, paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 12) + 8, transform: [{ translateX }, { scale }] },
          ]}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
            <Icon name="close" size={28} color={textMain} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
            <View style={styles.head}>
              <Logo size={58} />
              <Animated.View style={{ flex: 1, alignItems: 'flex-end', opacity: unfold, transform: [{ translateX: nameX }] }}>
                <Text style={styles.company} numberOfLines={2}>شركة تامرون العربية المحدودة</Text>
                <Text style={styles.who} numberOfLines={1}>
                  {user ? `${user.displayName || user.email}${staff?.jobTitle ? ' · ' + staff.jobTitle : ''}` : 'زائر'}
                </Text>
              </Animated.View>
            </View>

            <View style={styles.group}>
              {items.map((item, index) => {
                const expanded = open === item.key;
                const hasSubs = item.subs.length > 0;
                return (
                  <View key={item.key} style={index > 0 && styles.sep}>
                    <Pressable
                      onPress={() => (hasSubs ? setOpen(expanded ? null : item.key) : item.onPress ? run(item.onPress)() : undefined)}
                      style={({ pressed }) => [styles.row, pressed && { backgroundColor: '#17171A' }]}>
                      <Icon name={item.icon} size={26} color={textMain} />
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.label}>{item.label}</Text>
                        {item.subtitle ? <Text style={styles.sub}>{item.subtitle}</Text> : null}
                      </View>
                      {hasSubs ? <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={textDim} /> : <Icon name="chevron-back" size={20} color={textDim} />}
                    </Pressable>
                    {expanded ? (
                      <View style={styles.children}>
                        {item.subs.map((s) => (
                          <Pressable key={s.key} onPress={run(s.onPress)} style={({ pressed }) => [styles.child, pressed && { backgroundColor: '#17171A' }]}>
                            <View style={[styles.childIcon, { backgroundColor: s.color }]}>
                              <Icon name={solid(s.icon)} size={17} color="#fff" />
                            </View>
                            <Text style={styles.childLabel}>{s.label}</Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  backdrop: { ...(StyleSheet.absoluteFill as object), backgroundColor: 'rgba(0,0,0,0.55)' },
  panel: { marginLeft: 'auto', backgroundColor: sheet, borderTopLeftRadius: 32, borderBottomLeftRadius: 32, paddingHorizontal: 12 },
  close: { alignSelf: 'flex-start', padding: 6, marginBottom: 8 },
  head: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14, backgroundColor: card, borderRadius: 32, padding: 14 },
  company: { color: textMain, fontSize: 17, fontFamily: font.black, textAlign: 'right' },
  who: { color: textDim, fontSize: 12, fontFamily: font.regular, marginTop: 3, textAlign: 'right' },
  group: { backgroundColor: card, borderRadius: 28, overflow: 'hidden' },
  sep: { borderTopWidth: 2, borderTopColor: line },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 18 },
  label: { fontSize: 16, fontFamily: font.bold, color: textMain, textAlign: 'right' },
  sub: { fontSize: 11, fontFamily: font.regular, color: textDim, textAlign: 'right' },
  children: { paddingBottom: 8, backgroundColor: '#0B0B0D' },
  child: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 9, paddingRight: 28, paddingLeft: 18 },
  childIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  childLabel: { fontSize: 14, fontFamily: font.medium, color: textMain, flex: 1, textAlign: 'right' },
});
