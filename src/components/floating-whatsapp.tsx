import { usePathname } from 'expo-router';
import { Linking, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/kit';

const WHATSAPP_URL = 'https://wa.me/966501556846';

// Internal screens (login/register, admin, staff tooling) aren't where a customer
// asks sales a question, so the button only shows on the customer-facing app.
const HIDDEN_PREFIXES = ['/auth', '/admin', '/staff'];

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <Pressable
      onPress={() => Linking.openURL(WHATSAPP_URL)}
      style={({ pressed }) => [styles.button, { bottom: insets.bottom + 90 }, pressed && { opacity: 0.85 }]}>
      <Icon name="logo-whatsapp" size={28} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
    zIndex: 50,
  },
});
