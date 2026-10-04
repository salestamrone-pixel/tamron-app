import { useRouter } from 'expo-router';
import { sendEmailVerification } from 'firebase/auth';
import { useState } from 'react';

import { Button, Empty, Loading, Muted } from '@/components/kit';
import { auth } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';

export function StaffGate({ adminOnly = false, children }: { adminOnly?: boolean; children: React.ReactNode }) {
  const { user, isStaff, isAdmin, loading, refresh } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  if (loading) return <Loading />;

  if (!user) {
    return (
      <Empty title="خاص بموظفي الشركة" message="سجّل الدخول بحساب الموظف.">
        <Button label="تسجيل الدخول" onPress={() => router.push('/auth/login')} />
      </Empty>
    );
  }

  if (!user.emailVerified) {
    const resend = async () => {
      if (!auth.currentUser) return;
      setBusy(true);
      try {
        await sendEmailVerification(auth.currentUser);
        setNote('تم إرسال رسالة التفعيل. افتح بريدك واضغط الرابط.');
      } catch {
        setNote('تعذر الإرسال الآن. حاول بعد دقيقة.');
      } finally {
        setBusy(false);
      }
    };
    const check = async () => {
      setBusy(true);
      await refresh().catch(() => {});
      setBusy(false);
      setNote('لم يتم تفعيل البريد بعد.');
    };
    return (
      <Empty title="فعّل بريدك الإلكتروني" message={`أرسلنا رابط تفعيل إلى ${user.email}. بعد الضغط عليه ارجع واضغط «تم التفعيل».`}>
        {note ? <Muted>{note}</Muted> : null}
        <Button label="تم التفعيل" onPress={check} loading={busy} />
        <Button label="إعادة إرسال الرابط" variant="outline" onPress={resend} disabled={busy} />
      </Empty>
    );
  }

  if (!isStaff || (adminOnly && !isAdmin)) {
    return (
      <Empty
        title="غير مصرح"
        message={adminOnly ? 'هذه الصفحة لإدارة الشركة فقط.' : 'هذا القسم لموظفي الشركة فقط. إذا كنت موظفاً فاطلب من الإدارة إضافة بريدك.'}
      />
    );
  }

  return <>{children}</>;
}
