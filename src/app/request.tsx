import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';

import { Button, Dialog, Empty, ErrorText, Field, ListItem, palette, Screen } from '@/components/kit';
import { db } from '@/config/firebase';
import { SERVICES } from '@/constants/services';
import { useAuth } from '@/context/AuthContext';

export default function RequestScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId?: string }>();
  const service = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[SERVICES.length - 1];
  const { user } = useAuth();
  const router = useRouter();

  const [details, setDetails] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const header = <Stack.Screen options={{ title: 'طلب عرض سعر' }} />;

  if (!user) {
    return (
      <>
        {header}
        <Empty icon="lock-closed-outline" title="سجّل الدخول أولاً" message="تحتاج حساباً لإرسال الطلب ومتابعة رد الشركة.">
          <Button label="تسجيل الدخول" onPress={() => router.push('/auth/login')} />
        </Empty>
      </>
    );
  }

  const submit = async () => {
    if (details.trim().length < 10) {
      setError('اكتب مواصفات الطلب بشيء من التفصيل.');
      return;
    }
    if (phone.trim().length < 8) {
      setError('اكتب رقم جوال صحيح للتواصل.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await addDoc(collection(db, 'quoteRequests'), {
        userId: user.uid,
        userName: user.displayName ?? '',
        userEmail: user.email,
        phone: phone.trim(),
        serviceId: service.id,
        serviceName: service.name,
        details: details.trim(),
        dimensions: dimensions.trim(),
        quantity: quantity.trim(),
        location: location.trim(),
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setSent(true);
    } catch {
      setError('تعذر إرسال الطلب. تحقق من الاتصال وحاول مرة أخرى.');
    } finally {
      setSending(false);
    }
  };

  const finish = () => {
    setSent(false);
    router.dismissTo('/orders');
  };

  return (
    <Screen>
      {header}
      <ListItem icon={service.icon} title={service.name} subtitle={service.description} />

      <ErrorText>{error}</ErrorText>

      <Field label="المواصفات المطلوبة *" placeholder={service.specHint} value={details} onChangeText={setDetails} multiline />
      <Field label="المقاسات" placeholder="مثال: 3 × 1.5 متر" value={dimensions} onChangeText={setDimensions} />
      <Field label="الكمية" placeholder="مثال: 2" value={quantity} onChangeText={setQuantity} />
      <Field label="المدينة / موقع التركيب" value={location} onChangeText={setLocation} />
      <Field label="رقم الجوال للتواصل *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Button label="إرسال الطلب" icon="paper-plane-outline" onPress={submit} loading={sending} />

      <Dialog visible={sent} icon="checkmark-circle-outline" tone={palette.success} title="تم إرسال طلبك" message="سنراجع المواصفات ونرد عليك بعرض السعر. تابع الرد من صفحة «طلباتي»." onClose={finish}>
        <Button label="عرض طلباتي" onPress={finish} />
      </Dialog>
    </Screen>
  );
}
