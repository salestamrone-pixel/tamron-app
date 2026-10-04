import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Colours sampled from the company logo: black disc, gold ring, white square-Kufic lettering.
export const palette = {
  ink: '#0A0A0A',
  inkSoft: '#17150F',
  gold: '#CCA741',
  goldLight: '#EDD85D',
  goldDark: '#BE9639',
  success: '#0F8A5F',
  danger: '#C8324B',
  bg: '#F6F3EA',
  card: '#FFFFFF',
  text: '#0A0A0A',
  muted: '#756F60',
  border: '#E7E1CF',
  tint: '#F4EDD3',
};

export const goldGradient = [palette.goldDark, palette.goldLight, palette.gold] as const;
export const inkGradient = ['#000000', '#1C1910'] as const;

export const font = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  bold: 'Tajawal_700Bold',
  black: 'Tajawal_800ExtraBold',
};

export const headerOptions = {
  headerStyle: { backgroundColor: palette.ink },
  headerTintColor: palette.goldLight,
  headerTitleAlign: 'center' as const,
  headerTitleStyle: { fontFamily: font.bold, color: '#fff' },
  headerShadowVisible: false,
};

export function Icon({ name, size = 22, color = palette.text }: { name: IconName; size?: number; color?: string }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

export function Logo({ size = 72 }: { size?: number }) {
  return <Image source={require('@/assets/images/logo.png')} style={{ width: size, height: size }} resizeMode="contain" />;
}

// Abstract motif built from the same square-Kufic strokes as the logo: a rectilinear spiral and two gold squares.
const KUFIC_BARS = [
  [0, 0, 9, 1],
  [8, 0, 1, 9],
  [0, 8, 9, 1],
  [0, 2, 1, 7],
  [0, 2, 7, 1],
  [6, 2, 1, 5],
  [2, 6, 5, 1],
  [2, 4, 1, 3],
  [2, 4, 3, 1],
];
const KUFIC_GOLD = [
  [10, 2, 1, 1],
  [10, 4, 1, 1],
];

export function KuficPattern({ size = 200, style }: { size?: number; style?: ViewStyle }) {
  const u = size / 11;
  return (
    <View style={[{ width: size, height: size, pointerEvents: 'none' }, style]}>
      {KUFIC_BARS.map(([x, y, w, h], i) => (
        <View key={i} style={{ position: 'absolute', left: x * u, top: y * u, width: w * u, height: h * u, backgroundColor: '#fff', opacity: 0.09 }} />
      ))}
      {KUFIC_GOLD.map(([x, y, w, h], i) => (
        <LinearGradient
          key={`g${i}`}
          colors={goldGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', left: x * u, top: y * u, width: w * u, height: h * u, opacity: 0.9 }}
        />
      ))}
    </View>
  );
}

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Hero({
  title,
  subtitle,
  icon,
  logo = false,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  logo?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <LinearGradient colors={inkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <KuficPattern size={230} style={styles.heroPattern} />
      {logo ? <Logo size={76} /> : null}
      {icon ? (
        <LinearGradient colors={goldGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroIcon}>
          <Icon name={icon} size={28} color={palette.ink} />
        </LinearGradient>
      ) : null}
      <Text style={styles.heroTitle}>{title}</Text>
      <LinearGradient colors={goldGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroRule} />
      {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
      {children}
    </LinearGradient>
  );
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: ViewStyle; onPress?: () => void }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

function IconBubble({ icon, color, size = 50 }: { icon: IconName; color?: string; size?: number }) {
  return (
    <View style={[styles.iconBubble, { width: size, height: size }]}>
      <Icon name={icon} size={size * 0.5} color={color ?? palette.goldLight} />
    </View>
  );
}

export function ListItem({
  icon,
  title,
  subtitle,
  onPress,
  color,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.card, styles.listItem, pressed && styles.pressed]}>
      <IconBubble icon={icon} color={color} />
      <View style={styles.listText}>
        <Text style={styles.itemTitle}>{title}</Text>
        {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
      </View>
      {onPress ? <Icon name="chevron-left" size={24} color={palette.gold} /> : null}
    </Pressable>
  );
}

export function Tile({ icon, title, onPress }: { icon: IconName; title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, styles.tile, pressed && styles.pressed]}>
      <IconBubble icon={icon} size={52} />
      <Text style={styles.tileTitle}>{title}</Text>
      <View style={styles.tileCorner} />
    </Pressable>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

export function H1({ children }: { children: React.ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
}
export function Section({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionMark} />
      <Text style={styles.section}>{children}</Text>
    </View>
  );
}
export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}
export function P({ children }: { children: React.ReactNode }) {
  return <Text style={styles.p}>{children}</Text>;
}
export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

type ButtonVariant = 'primary' | 'dark' | 'outline' | 'danger' | 'success';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
}) {
  const fg =
    variant === 'primary' || variant === 'outline' ? palette.ink : variant === 'dark' ? palette.goldLight : '#fff';
  const inner = loading ? (
    <ActivityIndicator color={fg} />
  ) : (
    <>
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
      {icon ? <Icon name={icon} size={20} color={fg} /> : null}
    </>
  );
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.buttonWrap, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>
      {variant === 'primary' ? (
        <LinearGradient colors={goldGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
          {inner}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.button,
            variant === 'dark' && { backgroundColor: palette.ink },
            variant === 'danger' && { backgroundColor: palette.danger },
            variant === 'success' && { backgroundColor: palette.success },
            variant === 'outline' && styles.buttonOutline,
          ]}>
          {inner}
        </View>
      )}
    </Pressable>
  );
}

export function Field({ label, multiline, style, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#A39C89"
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, style]}
        {...props}
      />
    </View>
  );
}

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '1F' }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <View style={styles.error}>
      <Icon name="alert-circle-outline" size={18} color={palette.danger} />
      <Text style={styles.errorText}>{children}</Text>
    </View>
  );
}

export function Empty({ icon = 'inbox-outline', title, message, children }: { icon?: IconName; title: string; message?: string; children?: React.ReactNode }) {
  return (
    <View style={styles.empty}>
      <IconBubble icon={icon} size={84} />
      <Text style={[styles.h1, { textAlign: 'center' }]}>{title}</Text>
      {message ? <Text style={[styles.muted, { textAlign: 'center' }]}>{message}</Text> : null}
      <View style={styles.emptyActions}>{children}</View>
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.empty}>
      <ActivityIndicator size="large" color={palette.gold} />
    </View>
  );
}

export function Dialog({
  visible,
  title,
  message,
  icon,
  tone,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  message?: string;
  icon?: IconName;
  tone?: string;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <LinearGradient colors={goldGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.dialogRule} />
          <ScrollView contentContainerStyle={styles.dialogBody} keyboardShouldPersistTaps="handled">
            {icon ? (
              <View style={styles.dialogIcon}>
                <IconBubble icon={icon} color={tone} size={64} />
              </View>
            ) : null}
            <Text style={[styles.dialogTitle, icon ? { textAlign: 'center' } : null]}>{title}</Text>
            {message ? <Text style={[styles.p, icon ? { textAlign: 'center' } : null]}>{message}</Text> : null}
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && { color: palette.goldLight }]}>{label}</Text>
    </Pressable>
  );
}

const shadow = '0 6px 18px rgba(10,10,10,0.07)';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 16, gap: 14, width: '100%', maxWidth: 720, alignSelf: 'center', paddingBottom: 48 },
  hero: { borderRadius: 26, padding: 24, gap: 10, overflow: 'hidden', alignItems: 'flex-end' },
  heroPattern: { position: 'absolute', left: -46, top: -30 },
  heroIcon: { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: '#fff', fontSize: 28, fontFamily: font.black, textAlign: 'right' },
  heroRule: { width: 56, height: 4, borderRadius: 1 },
  heroSubtitle: { color: '#D9D3C0', fontSize: 15, fontFamily: font.regular, textAlign: 'right', lineHeight: 23 },
  card: {
    backgroundColor: palette.card,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: palette.border,
    boxShadow: shadow,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  listItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14 },
  listText: { flex: 1, gap: 2 },
  iconBubble: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.ink },
  itemTitle: { fontSize: 16, fontFamily: font.bold, color: palette.text, textAlign: 'right' },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  tile: { flexGrow: 1, flexBasis: '45%', alignItems: 'flex-end', gap: 14, minHeight: 124, justifyContent: 'space-between', overflow: 'hidden' },
  tileTitle: { fontSize: 15, fontFamily: font.bold, color: palette.text, textAlign: 'right' },
  tileCorner: { position: 'absolute', left: 14, top: 14, width: 10, height: 10, backgroundColor: palette.gold },
  h1: { fontSize: 24, fontFamily: font.black, color: palette.text, textAlign: 'right' },
  sectionRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 8 },
  sectionMark: { width: 10, height: 10, backgroundColor: palette.gold },
  section: { fontSize: 18, fontFamily: font.black, color: palette.text, textAlign: 'right' },
  title: { fontSize: 17, fontFamily: font.bold, color: palette.text, textAlign: 'right' },
  p: { fontSize: 15, fontFamily: font.regular, color: palette.text, lineHeight: 24, textAlign: 'right' },
  muted: { fontSize: 13, fontFamily: font.regular, color: palette.muted, lineHeight: 20, textAlign: 'right' },
  field: { gap: 6 },
  label: { fontSize: 14, fontFamily: font.bold, color: palette.text, textAlign: 'right' },
  input: {
    backgroundColor: palette.card,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: font.regular,
    color: palette.text,
    textAlign: 'right',
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  buttonWrap: { borderRadius: 14, overflow: 'hidden', flexGrow: 1 },
  button: {
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: { borderWidth: 1.5, borderColor: palette.ink, backgroundColor: 'transparent' },
  buttonText: { fontSize: 16, fontFamily: font.bold },
  disabled: { opacity: 0.5 },
  badge: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeDot: { width: 7, height: 7 },
  badgeText: { fontSize: 12, fontFamily: font.bold },
  error: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FBE6EA',
    padding: 12,
    borderRadius: 12,
  },
  errorText: { flex: 1, color: palette.danger, fontSize: 14, fontFamily: font.medium, textAlign: 'right' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12, backgroundColor: palette.bg },
  emptyActions: { width: '100%', maxWidth: 360, gap: 10, marginTop: 8 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  dialog: {
    backgroundColor: palette.card,
    borderRadius: 24,
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
  },
  dialogRule: { height: 5 },
  dialogBody: { padding: 22, gap: 14 },
  dialogIcon: { alignSelf: 'center' },
  dialogTitle: { fontSize: 20, fontFamily: font.black, color: palette.text, textAlign: 'right' },
  row: { flexDirection: 'row-reverse', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  chip: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: palette.card,
  },
  chipSelected: { backgroundColor: palette.ink, borderColor: palette.ink },
  chipText: { fontSize: 13, color: palette.text, fontFamily: font.bold },
});
