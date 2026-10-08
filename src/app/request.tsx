import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Button, Dialog, Empty, ErrorText, Field, Icon, ListItem, Muted, palette, Screen } from '@/components/kit';
import { db } from '@/config/firebase';
import { SERVICES } from '@/constants/services';
import { useAuth } from '@/context/AuthContext';
import { pickImages, uploadAttachment } from '@/lib/attachments';

export default function RequestScreen() {
  const { serviceId, product } = useLocalSearchParams<{ serviceId?: string; product?: string }>();
  const service = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[SERVICES.length - 1];
  const { user } = useAuth();
  const router = useRouter();

  const [details, setDetails] = useState(product ? `أرغب بطلب: ${product}` : '');
  const [dimensions, setDimensions] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [picking, setPicking] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const header = <Stack.Screen options={{ title: 'طلب عرض سعر' }} />;

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        const savedPhone = snap.data()?.phone;
        if (savedPhone) setPhone((current) => current || savedPhone);
      })
      .catch(() => {});
  }, [user]);

  const addImages = async () => {
    setPicking(true);
    try {
      const picked = await pickImages(5 - images.length);
      setImages((current) => [...current, ...picked].slice(0, 5));
    } finally {
      setPicking(false);
    }
  };

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
      const attachments = await Promise.all(images.map((uri) => uploadAttachment(user.uid, uri)));
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
        attachments,
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
      <ListItem icon={service.icon} color={service.color} title={service.name} subtitle={service.description} />

      <ErrorText>{error}</ErrorText>

      <Field label="المواصفات المطلوبة *" placeholder={service.specHint} value={details} onChangeText={setDetails} multiline />
      <Field label="المقاسات" placeholder="مثال: 3 × 1.5 متر" value={dimensions} onChangeText={setDimensions} />
      <Field label="الكمية" placeholder="مثال: 2" value={quantity} onChangeText={setQuantity} />
      <Field label="المدينة / موقع التركيب" value={location} onChangeText={setLocation} />
      <Field label="رقم الجوال للتواصل *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Muted>صور مرجعية (اختياري، حتى 5 صور)</Muted>
      <View style={styles.imagesRow}>
        {images.map((uri, i) => (
          <View key={uri} style={styles.thumbWrap}>
            <Image source={{ uri }} style={styles.thumb} />
            <Pressable
              style={styles.removeBtn}
              onPress={() => setImages((current) => current.filter((_, idx) => idx !== i))}>
              <Icon name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
        {images.length < 5 ? (
          <Pressable style={styles.addBtn} onPress={addImages} disabled={picking}>
            <Icon name="camera-outline" size={22} color={palette.goldDark} />
          </Pressable>
        ) : null}
      </View>

      <Button label="إرسال الطلب" icon="paper-plane-outline" onPress={submit} loading={sending} />

      <Dialog visible={sent} icon="checkmark-circle-outline" tone={palette.success} title="تم إرسال طلبك" message="سنراجع المواصفات ونرد عليك بعرض السعر. تابع الرد من صفحة «طلباتي»." onClose={finish}>
        <Button label="عرض طلباتي" onPress={finish} />
      </Dialog>
    </Screen>
  );
}

const styles = StyleSheet.create({
  imagesRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 },
  thumbWrap: { width: 72, height: 72 },
  thumb: { width: 72, height: 72, borderRadius: 14, backgroundColor: palette.surface },
  removeBtn: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.danger,
  },
  addBtn: {
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderStyle: 'dashed',
  },
});
