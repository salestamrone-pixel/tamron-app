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

const glass = 'rgba(255,236,200,0.1)';
const glassBorder = 'rgba(255,225,170,0.3)';

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

// Large, detailed tile: gradient body, gloss highlight, watermark glyph, icon disc, title and caption.
function MegaTile({ item, active, onPress }: { item: MainItem; active: boolean; onPress: () => void }) {
  const glyph = solidIcon(item.icon);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.mega, active && styles.megaActive, pressed && { opacity: 0.88 }]}>
      <LinearGradient colors={[item.color, item.color + 'D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']} style={StyleSheet.absoluteFill} />
      <View style={styles.watermark}>
        <Icon name={glyph} size={120} color="rgba(255,255,255,0.17)" />
      </View>
      <LinearGradient colors={['rgba(255,255,255,0.32)', 'rgba(255,255,255,0)']} style={styles.gloss} />
      <View style={styles.disc}>
        <Icon name={glyph} size={32} color="#fff" />
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.megaTitle}>{item.label}</Text>
        {item.subtitle ? <Text style={styles.megaSub}>{item.subtitle}</Text> : null}
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
    minHeight: 132,
    borderRadius: 28,
    padding: 14,
    overflow: 'hidden',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    boxShadow: '0 10px 22px rgba(0,0,0,0.35)',
  },
  megaActive: { borderWidth: 2, borderColor: palette.goldLight },
  watermark: { position: 'absolute', left: -22, bottom: -26 },
  gloss: { position: 'absolute', top: 0, left: 0, right: 0, height: 54 },
  disc: { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', alignItems: 'center', justifyContent: 'center' },
  megaTitle: { fontSize: 18, fontFamily: font.black, color: '#fff', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 4 },
  megaSub: { fontSize: 11, fontFamily: font.medium, color: 'rgba(255,255,255,0.85)', marginTop: 1 },
  squircle: { alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(0,0,0,0.35)' },
  subPanel: { backgroundColor: glass, borderColor: glassBorder, borderWidth: 1, borderRadius: 26, padding: 14 },
  subGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' },
  sub: { width: 72, alignItems: 'center', gap: 6, paddingVertical: 6 },
  subLabel: { fontSize: 11, fontFamily: font.bold, color: '#fff', textAlign: 'center', lineHeight: 15, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
});
