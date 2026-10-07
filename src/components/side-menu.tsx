import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Animated, BackHandler, PanResponder, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { font, Icon, IconName, Logo } from '@/components/kit';
import { useAuth } from '@/context/AuthContext';
import { closeMenu, isMenuOpen, menuProgress, openMenu } from '@/lib/menu-store';
import { useMenuItems } from '@/lib/use-menu-items';

function solid(name: IconName): IconName {
  const s = name.replace(/-outline$/, '') as IconName;
  return Ionicons.glyphMap[s] !== undefined ? s : name;
}

const sheet = '#2B2B2E';
const card = '#000000';
const line = '#2B2B2E';
const textMain = '#F4F4F5';
const textDim = '#A1A1AA';

const clamp = (v: number) => Math.max(0, Math.min(1, v));

// Google-style account sheet. It follows the finger when dragged from the right screen edge,
// and the same drawer opens from the logo button.
export function SideMenu() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, staff } = useAuth();
  const items = useMenuItems();
  const [open, setOpen] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const panelWidth = Math.min(width * 0.92, 420);

  useEffect(() => {
    const id = menuProgress.addListener(({ value }) => setActive(value > 0.01));
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isMenuOpen()) {
        closeMenu();
        return true;
      }
      return false;
    });
    return () => {
      menuProgress.removeListener(id);
      sub.remove();
    };
  }, []);

  const settle = (vx: number, progress: number) => (vx > 0.4 ? closeMenu() : vx < -0.4 ? openMenu() : progress > 0.5 ? openMenu() : closeMenu());

  // Edge strip: a swipe that starts at the right edge pulls the panel in with the finger.
  const edge = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => menuProgress.setValue(clamp(-g.dx / panelWidth)),
        onPanResponderRelease: (_, g) => settle(g.vx, clamp(-g.dx / panelWidth)),
        onPanResponderTerminate: () => closeMenu(),
      }),
    [panelWidth],
  );

  // Drag the open panel to the right to close it.
  const panel = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dx > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderMove: (_, g) => menuProgress.setValue(clamp(1 - g.dx / panelWidth)),
        onPanResponderRelease: (_, g) => settle(g.vx, clamp(1 - g.dx / panelWidth)),
        onPanResponderTerminate: () => openMenu(),
      }),
    [panelWidth],
  );

  const run = (fn: () => void) => () => {
    closeMenu();
    fn();
  };

  const translateX = menuProgress.interpolate({ inputRange: [0, 1], outputRange: [panelWidth, 0] });
  const unfold = menuProgress.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <>
      {!active ? <View {...edge.panHandlers} style={[styles.edge, { top: insets.top + 60, bottom: insets.bottom + 90 }]} /> : null}
      <View pointerEvents={active ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, { opacity: menuProgress }]}>
          <Pressable style={{ flex: 1 }} onPress={closeMenu} />
        </Animated.View>
        <Animated.View
          {...panel.panHandlers}
          style={[styles.panel, { width: panelWidth, paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 12) + 8, transform: [{ translateX }] }]}>
          <Pressable onPress={closeMenu} hitSlop={12} style={styles.close}>
            <Icon name="close" size={28} color={textMain} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
            <View style={styles.head}>
              <Logo size={58} />
              <Animated.View style={{ flex: 1, alignItems: 'flex-end', opacity: unfold }}>
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
    </>
  );
}

const styles = StyleSheet.create({
  edge: { position: 'absolute', right: 0, width: 22, zIndex: 20 },
  backdrop: { ...(StyleSheet.absoluteFill as object), backgroundColor: 'rgba(0,0,0,0.55)' },
  panel: { position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: sheet, borderTopLeftRadius: 32, borderBottomLeftRadius: 32, paddingHorizontal: 12 },
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
