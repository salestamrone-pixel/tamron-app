import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
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
  subtitle?: string;
  icon: IconName;
  color: string;
  subs: SubItem[];
  onPress?: () => void;
}

const glass = 'rgba(255,255,255,0.78)';
const glassBorder = 'rgba(255,255,255,0.95)';

// Solid glyph when the icon set has one: reads bolder over a photo.
function solidIcon(name: IconName): IconName {
  const solid = name.replace(/-outline$/, '') as IconName;
  return Ionicons.glyphMap[solid] !== undefined ? solid : name;
}

function Squircle({ icon, color, size }: { icon: IconName; color: string; size: number }) {
  return (
    <LinearGradient
      colors={[color, color + 'CC']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.squircle, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <Icon name={solidIcon(icon)} size={size * 0.5} color="#fff" />
    </LinearGradient>
  );
}

// Frosted-glass tile: clean coloured icon badge, bold title, soft caption.
function MegaTile({ item, active, onPress }: { item: MainItem; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.mega, active && styles.megaActive, pressed && { opacity: 0.85 }]}>
      <Squircle icon={item.icon} color={item.color} size={64} />
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text style={styles.megaTitle}>{item.label}</Text>
        {item.subtitle ? <Text style={styles.megaSub} numberOfLines={1}>{item.subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

export function MainMenu({ items }: { items: MainItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const current = items.find((i) => i.key === open);
  return (
    <View style={styles.menu}>
      <View style={styles.grid}>
        {items.map((item) => (
          <MegaTile
            key={item.key}
            item={item}
            active={open === item.key}
            onPress={() => (item.onPress ? item.onPress() : setOpen(open === item.key ? null : item.key))}
          />
        ))}
      </View>
      {current ? (
        <View key={current.key} style={styles.subPanel}>
          <View style={styles.subGrid}>
            {current.subs.map((sub) => (
              <Pressable key={sub.key} onPress={sub.onPress} style={({ pressed }) => [styles.sub, pressed && { opacity: 0.7 }]}>
                <Squircle icon={sub.icon} color={sub.color} size={58} />
                <Text style={styles.subLabel} numberOfLines={2}>
                  {sub.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: { gap: 14 },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  mega: {
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: 136,
    borderRadius: 26,
    padding: 14,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: glass,
    borderWidth: 1.5,
    borderColor: glassBorder,
    boxShadow: '0 10px 24px rgba(8,30,70,0.28)',
  },
  megaActive: { borderColor: palette.gold, backgroundColor: 'rgba(255,255,255,0.92)' },
  megaTitle: { fontSize: 18, fontFamily: font.black, color: '#0B1B33' },
  megaSub: { fontSize: 11, fontFamily: font.medium, color: '#4B5B73' },
  squircle: { alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(0,0,0,0.35)' },
  subPanel: { backgroundColor: glass, borderColor: glassBorder, borderWidth: 1, borderRadius: 26, padding: 14 },
  subGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' },
  sub: { width: 72, alignItems: 'center', gap: 6, paddingVertical: 6 },
  subLabel: { fontSize: 11, fontFamily: font.bold, color: '#0B1B33', textAlign: 'center', lineHeight: 15 },
});
