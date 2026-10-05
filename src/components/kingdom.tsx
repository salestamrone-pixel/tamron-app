import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
      colors={[color, color + 'CC']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.squircle, { width: size, height: size, borderRadius: size * 0.3, borderColor: active ? palette.goldLight : 'transparent', borderWidth: active ? 2 : 0, boxShadow: '0 6px 14px rgba(0,0,0,0.35)' }]}>
      <Icon name={solidIcon(icon)} size={size * 0.46} color="#fff" />
    </LinearGradient>
  );
}

function Orb({ item, active, onPress }: { item: MainItem; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.orbWrap}>
      <Squircle icon={item.icon} color={item.color} size={62} active={active} />
      <Text style={[styles.orbLabel, active && { color: palette.goldLight }]}>{item.label}</Text>
    </Pressable>
  );
}

export function MainMenu({ items }: { items: MainItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const current = items.find((i) => i.key === open);
  return (
    <View style={styles.menu}>
      <View style={styles.orbRow}>
        {items.map((item) => (
          <Orb key={item.key} item={item} active={open === item.key} onPress={() => (item.onPress ? item.onPress() : setOpen(open === item.key ? null : item.key))} />
        ))}
      </View>
      {current ? (
        <View key={current.key} style={styles.subPanel}>
          <View style={styles.subGrid}>
            {current.subs.map((sub) => (
              <View key={sub.key}>
                <Pressable onPress={sub.onPress} style={({ pressed }) => [styles.sub, pressed && { opacity: 0.7 }]}>
                  <Squircle icon={sub.icon} color={sub.color} size={50} />
                  <Text style={styles.subLabel} numberOfLines={2}>
                    {sub.label}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
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
