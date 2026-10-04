import React from 'react';
import {
  ActivityIndicator,
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

export const palette = {
  primary: '#0f4c81',
  primaryDark: '#0a3559',
  accent: '#f59e0b',
  success: '#15803d',
  danger: '#dc2626',
  bg: '#f1f5f9',
  card: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  tint: '#e0ecf7',
};

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  if (!scroll) return <View style={styles.screen}>{children}</View>;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
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

export function H1({ children }: { children: React.ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
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

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'success';

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
}) {
  const outline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && { backgroundColor: palette.primary },
        variant === 'danger' && { backgroundColor: palette.danger },
        variant === 'success' && { backgroundColor: palette.success },
        outline && styles.buttonOutline,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={outline ? palette.primary : '#fff'} />
      ) : (
        <Text style={[styles.buttonText, outline && { color: palette.primary }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Field({ label, multiline, style, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, style]}
        {...props}
      />
    </View>
  );
}

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <Text style={styles.error}>{children}</Text>;
}

export function Empty({ title, message, children }: { title: string; message?: string; children?: React.ReactNode }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.h1}>{title}</Text>
      {message ? <Text style={[styles.muted, { textAlign: 'center' }]}>{message}</Text> : null}
      {children}
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.empty}>
      <ActivityIndicator size="large" color={palette.primary} />
    </View>
  );
}

export function Dialog({
  visible,
  title,
  message,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  message?: string;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <Text style={styles.dialogTitle}>{title}</Text>
          {message ? <Text style={styles.p}>{message}</Text> : null}
          {children}
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
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 16, gap: 14, width: '100%', maxWidth: 720, alignSelf: 'center', paddingBottom: 40 },
  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    boxShadow: '0 2px 10px rgba(15,23,42,0.07)',
  },
  pressed: { opacity: 0.75 },
  h1: { fontSize: 22, fontWeight: '800', color: palette.text, textAlign: 'right' },
  title: { fontSize: 17, fontWeight: '700', color: palette.primary, textAlign: 'right' },
  p: { fontSize: 15, color: palette.text, lineHeight: 23, textAlign: 'right' },
  muted: { fontSize: 13, color: palette.muted, lineHeight: 20, textAlign: 'right' },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: palette.text, textAlign: 'right' },
  input: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: palette.text,
    textAlign: 'right',
  },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  button: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  buttonOutline: { borderWidth: 1.5, borderColor: palette.primary, backgroundColor: 'transparent' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.55 },
  badge: { alignSelf: 'flex-end', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  error: {
    color: palette.danger,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12, backgroundColor: palette.bg },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  dialog: {
    backgroundColor: palette.card,
    borderRadius: 20,
    padding: 22,
    gap: 14,
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
  },
  dialogTitle: { fontSize: 19, fontWeight: '800', color: palette.text, textAlign: 'right' },
  row: { flexDirection: 'row-reverse', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: palette.card,
  },
  chipSelected: { backgroundColor: palette.primary, borderColor: palette.primary },
  chipText: { fontSize: 13, color: palette.text, fontWeight: '600' },
});
