import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { font, Icon, IconName } from '@/components/kit';

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

const glass = 'rgba(255,255,255,0.2)';
const glassBorder = 'rgba(255,255,255,0.7)';

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
function MegaTile({ item, onPress }: { item: MainItem; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.mega, pressed && { opacity: 0.8 }]}>
      <Squircle icon={item.icon} color={item.color} size={64} />
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text style={styles.megaTitle}>{item.label}</Text>
        {item.subtitle ? <Text style={styles.megaSub} numberOfLines={1}>{item.subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

// Tiles with sub-items open a page of their own (onOpenSection); the others go straight to their screen.
export function MainMenu({ items, onOpenSection }: { items: MainItem[]; onOpenSection: (key: string) => void }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <MegaTile key={item.key} item={item} onPress={() => (item.subs.length > 0 ? onOpenSection(item.key) : item.onPress?.())} />
      ))}
    </View>
  );
}

// The sub-icons of one section, shown on their own page.
export function SubGrid({ subs }: { subs: SubItem[] }) {
  return (
    <View style={styles.subGrid}>
      {subs.map((sub) => (
        <Pressable key={sub.key} onPress={sub.onPress} style={({ pressed }) => [styles.sub, pressed && { opacity: 0.8 }]}>
          <Squircle icon={sub.icon} color={sub.color} size={64} />
          <Text style={styles.subLabel} numberOfLines={2}>
            {sub.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
    boxShadow: '0 10px 24px rgba(8,30,70,0.18)',
  },
  megaTitle: { fontSize: 18, fontFamily: font.black, color: '#0B1B33', textShadowColor: 'rgba(255,255,255,0.9)', textShadowRadius: 6 },
  megaSub: { fontSize: 11, fontFamily: font.bold, color: '#243653', textShadowColor: 'rgba(255,255,255,0.9)', textShadowRadius: 5 },
  squircle: { alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(0,0,0,0.3)' },
  subGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  sub: {
    flexBasis: '30%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 6,
    borderRadius: 24,
    backgroundColor: glass,
    borderWidth: 1.5,
    borderColor: glassBorder,
  },
  subLabel: { fontSize: 12, fontFamily: font.bold, color: '#0B1B33', textAlign: 'center', lineHeight: 17, textShadowColor: 'rgba(255,255,255,0.9)', textShadowRadius: 5 },
});
