import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { font, Icon, IconName, palette } from '@/components/kit';

export interface SubItem {
  key: string;
  label: string;
  icon: IconName;
  color: string;
  onPress: () => void;
}
export interface MainItem {
  key: string;
  label: string;
  icon: IconName;
  color: string;
  subs: SubItem[];
  onPress?: () => void;
}

// Translucent "glass" surfaces so the city photo behind stays visible.
const glass = 'rgba(255,236,200,0.07)';
const glassBorder = 'rgba(255,225,170,0.28)';

// Solid glyph when the icon set has one: reads bolder over a photo.
function solidIcon(name: IconName): IconName {
  const solid = name.replace(/-outline$/, '') as IconName;
  return Ionicons.glyphMap[solid] !== undefined ? solid : name;
}

function Squircle({ icon, color, size, active }: { icon: IconName; color: string; size: number; active?: boolean }) {
  return (
    <LinearGradient
      colors={[color + 'B3', color + '33']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.squircle, { width: size, height: size, borderRadius: size * 0.32, borderColor: active ? palette.goldLight : 'rgba(255,255,255,0.4)' }]}>
      <Icon name={solidIcon(icon)} size={size * 0.46} color="#fff" />
    </LinearGradient>
  );
}

function Orb({ item, active, index, onPress }: { item: MainItem; active: boolean; index: number; onPress: () => void }) {
  const y = useSharedValue(0);
  const s = useSharedValue(1);
  useEffect(() => {
    y.value = withDelay(index * 250, withRepeat(withSequence(withTiming(-5, { duration: 1300 }), withTiming(0, { duration: 1300 })), -1));
  }, [index, y]);
  useEffect(() => {
    s.value = withSpring(active ? 1.12 : 1, { damping: 8 });
  }, [active, s]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }, { scale: s.value }] }));
  return (
    <Pressable onPress={onPress} style={styles.orbWrap}>
      <Animated.View style={style}>
        <Squircle icon={item.icon} color={item.color} size={62} active={active} />
      </Animated.View>
      <Text style={[styles.orbLabel, active && { color: palette.goldLight }]}>{item.label}</Text>
    </Pressable>
  );
}

export function MainMenu({ items }: { items: MainItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const current = items.find((i) => i.key === open);
  return (
    <Animated.View layout={LinearTransition.springify()} style={styles.menu}>
      <View style={styles.orbRow}>
        {items.map((item, i) => (
          <Orb key={item.key} item={item} index={i} active={open === item.key} onPress={() => (item.onPress ? item.onPress() : setOpen(open === item.key ? null : item.key))} />
        ))}
      </View>
      {current ? (
        <Animated.View key={current.key} entering={FadeInDown.springify()} exiting={FadeOut.duration(120)} style={styles.subPanel}>
          <View style={styles.subGrid}>
            {current.subs.map((sub, i) => (
              <Animated.View key={sub.key} entering={ZoomIn.delay(i * 45).springify().damping(11)}>
                <Pressable onPress={sub.onPress} style={({ pressed }) => [styles.sub, pressed && { opacity: 0.7 }]}>
                  <Squircle icon={sub.icon} color={sub.color} size={50} />
                  <Text style={styles.subLabel} numberOfLines={2}>
                    {sub.label}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  menu: { gap: 14 },
  orbRow: { flexDirection: 'row-reverse', justifyContent: 'space-around', paddingTop: 4 },
  orbWrap: { alignItems: 'center', gap: 8, minWidth: 62 },
  squircle: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  orbLabel: { fontSize: 13, fontFamily: font.bold, color: '#fff', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
  subPanel: { backgroundColor: glass, borderColor: glassBorder, borderWidth: 1, borderRadius: 26, padding: 14 },
  subGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' },
  sub: { width: 68, alignItems: 'center', gap: 6, paddingVertical: 6 },
  subLabel: { fontSize: 11, fontFamily: font.bold, color: '#fff', textAlign: 'center', lineHeight: 15, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
});
