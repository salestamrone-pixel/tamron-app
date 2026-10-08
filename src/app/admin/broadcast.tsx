import { Stack } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';

import { Button, Dialog, ErrorText, Field, Muted, Screen } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';

function Broadcast() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (title.trim().length < 2 || body.trim().length < 2) {
      setError('اكتب عنوان ونص الإشعار.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await addDoc(collection(db, 'broadcasts'), {
        title: title.trim(),
        body: body.trim(),
        createdBy: user?.email ?? '',
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setBody('');
      setSent(true);
    } catch {
      setError('تعذر الإرسال. تأكد من الاتصال وحاول مرة أخرى.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen>
      <Muted>يصل هذا الإشعار لكل عميل وموظف فتح التطبيق وسمح بالإشعارات — استخدمه لعرض أو خبر مهم فقط.</Muted>
      <ErrorText>{error}</ErrorText>
      <Field label="العنوان" placeholder="مثال: عرض خاص هذا الأسبوع" value={title} onChangeText={setTitle} />
      <Field label="النص" placeholder="تفاصيل العرض أو الخبر" value={body} onChangeText={setBody} multiline />
      <Button label="إرسال للجميع" icon="megaphone-outline" variant="gold" onPress={send} loading={sending} />

      <Dialog visible={sent} icon="checkmark-circle-outline" title="تم الإرسال" message="هيوصل الإشعار خلال لحظات لكل من سمح بالإشعارات." onClose={() => setSent(false)}>
        <Button label="حسناً" onPress={() => setSent(false)} />
      </Dialog>
    </Screen>
  );
}

export default function AdminBroadcast() {
  return (
    <>
      <Stack.Screen options={{ title: 'إشعار للعملاء' }} />
      <StaffGate adminOnly>
        <Broadcast />
      </StaffGate>
    </>
  );
}
