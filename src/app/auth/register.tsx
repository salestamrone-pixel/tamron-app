import { Stack, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { useState } from 'react';

import { Button, ErrorText, Field, H1, Muted, Screen } from '@/components/kit';
import { GoogleButton } from '@/components/google-button';
import { auth } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const register = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('املأ جميع الحقول.');
      return;
    }
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
      return;
    }
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await sendEmailVerification(cred.user).catch(() => {});
      await refresh();
      if (router.canGoBack()) router.back();
      else router.replace('/');
    } catch (e: any) {
      setError(
        e?.code === 'auth/email-already-in-use'
          ? 'هذا البريد مسجل بالفعل. جرّب تسجيل الدخول.'
          : e?.code === 'auth/invalid-email'
            ? 'البريد الإلكتروني غير صحيح.'
            : 'تعذر إنشاء الحساب. حاول مرة أخرى.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'إنشاء حساب' }} />
      <H1>حساب جديد</H1>
      <Muted>موظفو الشركة: سجّلوا بنفس البريد الذي أضافته الإدارة.</Muted>
      <GoogleButton />
      <ErrorText>{error}</ErrorText>
      <Field label="الاسم الكامل" value={name} onChangeText={setName} />
      <Field label="البريد الإلكتروني" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={{ textAlign: 'left' }} />
      <Field label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry style={{ textAlign: 'left' }} />
      <Field label="تأكيد كلمة المرور" value={confirm} onChangeText={setConfirm} secureTextEntry style={{ textAlign: 'left' }} />
      <Button label="إنشاء الحساب" onPress={register} loading={loading} />
      <Button label="لدي حساب بالفعل" variant="outline" onPress={() => router.replace('/auth/login')} />
    </Screen>
  );
}
