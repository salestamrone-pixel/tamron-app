import { Stack, useRouter } from 'expo-router';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';

import { Button, Dialog, ErrorText, Field, H1, Muted, Screen } from '@/components/kit';
import { auth } from '@/config/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const login = async () => {
    if (!email.trim() || !password) {
      setError('اكتب البريد الإلكتروني وكلمة المرور.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      if (router.canGoBack()) router.back();
      else router.replace('/');
    } catch {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    if (!email.trim()) {
      setError('اكتب بريدك الإلكتروني أولاً ثم اضغط «نسيت كلمة المرور».');
      return;
    }
    setError('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch {
      // Same message either way so the form does not reveal which emails have accounts.
    }
    setResetSent(true);
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'تسجيل الدخول' }} />
      <H1>مرحباً بك</H1>
      <Muted>سجّل الدخول إلى حسابك.</Muted>
      <ErrorText>{error}</ErrorText>
      <Field label="البريد الإلكتروني" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={{ textAlign: 'left' }} />
      <Field label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry style={{ textAlign: 'left' }} />
      <Button label="تسجيل الدخول" onPress={login} loading={loading} />
      <Button label="إنشاء حساب جديد" variant="outline" onPress={() => router.replace('/auth/register')} />
      <Button label="نسيت كلمة المرور؟" variant="outline" onPress={reset} />

      <Dialog visible={resetSent} title="تحقق من بريدك" message="إذا كان البريد مسجلاً لدينا فستصلك رسالة لإعادة تعيين كلمة المرور." onClose={() => setResetSent(false)}>
        <Button label="حسناً" onPress={() => setResetSent(false)} />
      </Dialog>
    </Screen>
  );
}
