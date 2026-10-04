import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, ErrorText, font, palette } from '@/components/kit';
import { googleSignInAvailable, signInWithGoogle } from '@/lib/google';

export function GoogleButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!googleSignInAvailable) return null;

  const go = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      if (router.canGoBack()) router.back();
      else router.replace('/');
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        setError(
          e?.code === 'auth/popup-blocked'
            ? 'المتصفح منع نافذة جوجل. اسمح بالنوافذ المنبثقة وحاول مرة أخرى.'
            : 'تعذر تسجيل الدخول بحساب جوجل.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ErrorText>{error}</ErrorText>
      <Button label="المتابعة بحساب Google" icon="logo-google" variant="outline" onPress={go} loading={loading} />
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>أو بالبريد الإلكتروني</Text>
        <View style={styles.line} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { flex: 1, height: 1, backgroundColor: palette.border },
  or: { fontFamily: font.medium, fontSize: 13, color: palette.muted },
});
