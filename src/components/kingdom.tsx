import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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

// The brand is black + a single gold ring (see the logo and the company's own profile
// deck), not a rainbow of pastel icons — so every badge shares this one treatment
// instead of each item's own `color`, and the cards read as one coherent, premium set.
const glass = 'rgba(10,10,10,0.6)';
const glassBorder = 'rgba(204,167,65,0.55)';

// Solid glyph when the icon set has one: reads bolder over a photo.
function solidIcon(name: IconName): IconName {
  const solid = name.replace(/-outline$/, '') as IconName;
  return Ionicons.glyphMap[solid] !== undefined ? solid : name;
}

// Badge in the logo's own language: a black disc, a gold ring, a gold glyph.
function Badge({ icon, size }: { icon: IconName; size: number }) {
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2, borderWidth: Math.max(1.5, size * 0.03) }]}>
      <Icon name={solidIcon(icon)} size={size * 0.46} color={palette.gold} />
    </View>
  );
}

function MegaTile({ item, onPress }: { item: MainItem; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.mega, pressed && { opacity: 0.8 }]}>
      <Badge icon={item.icon} size={62} />
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
          <Badge icon={sub.icon} size={60} />
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
    boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
  },
  megaTitle: { fontSize: 18, fontFamily: font.black, color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 5 },
  megaSub: { fontSize: 11, fontFamily: font.medium, color: '#D9C78F' },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.ink,
    borderColor: palette.gold,
    boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
  },
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
  subLabel: { fontSize: 12, fontFamily: font.bold, color: '#fff', textAlign: 'center', lineHeight: 17, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
});
