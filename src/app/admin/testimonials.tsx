import { Stack } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Dialog, Empty, ErrorText, Field, Icon, Loading, Muted, P, palette, Row, Screen, Title } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { Testimonial } from '@/types';

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)} hitSlop={6}>
          <Icon name={n <= value ? 'star' : 'star-outline'} size={26} color={palette.gold} />
        </Pressable>
      ))}
    </View>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name={n <= value ? 'star' : 'star-outline'} size={16} color={palette.gold} />
      ))}
    </View>
  );
}

function TestimonialsAdmin() {
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Testimonial | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Testimonial, 'id'>) }))));
  }, []);

  const add = async () => {
    if (name.trim().length < 2 || text.trim().length < 5) {
      setError('اكتب اسم العميل ونص الرأي.');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'testimonials'), {
        name: name.trim(),
        role: role.trim(),
        text: text.trim(),
        rating,
        createdAt: serverTimestamp(),
      });
      setAdding(false);
      setName('');
      setRole('');
      setText('');
      setRating(5);
      setError('');
    } catch {
      setError('تعذر الحفظ.');
    } finally {
      setSaving(false);
    }
  };

  if (items === null) return <Loading />;

  return (
    <Screen>
      <Button label="إضافة رأي عميل" icon="add-circle-outline" variant="gold" onPress={() => setAdding(true)} />
      {items.length === 0 ? <Empty icon="chatbox-ellipses-outline" title="لا توجد آراء بعد" message="أضف أول رأي عميل ليظهر في صفحة «من نحن»." /> : null}
      {items.map((t) => (
        <Card key={t.id}>
          <Stars value={t.rating} />
          <Title>{t.name}</Title>
          {t.role ? <Muted>{t.role}</Muted> : null}
          <P>{t.text}</P>
          <Row>
            <Button label="حذف" variant="danger" onPress={() => setRemoving(t)} />
          </Row>
        </Card>
      ))}

      <Dialog visible={adding} title="رأي عميل جديد" onClose={() => setAdding(false)}>
        <ErrorText>{error}</ErrorText>
        <Field label="اسم العميل" value={name} onChangeText={setName} />
        <Field label="الصفة (اختياري)" placeholder="مثال: صاحب مشروع، مدير تسويق" value={role} onChangeText={setRole} />
        <Field label="نص الرأي" value={text} onChangeText={setText} multiline />
        <StarPicker value={rating} onChange={setRating} />
        <Button label="حفظ" onPress={add} loading={saving} />
        <Button label="إلغاء" variant="outline" onPress={() => setAdding(false)} />
      </Dialog>

      <Dialog visible={removing !== null} title="حذف الرأي" message={`حذف رأي «${removing?.name ?? ''}»؟`} onClose={() => setRemoving(null)}>
        <Button
          label="حذف"
          variant="danger"
          onPress={async () => {
            if (removing) await deleteDoc(doc(db, 'testimonials', removing.id));
            setRemoving(null);
          }}
        />
        <Button label="إلغاء" variant="outline" onPress={() => setRemoving(null)} />
      </Dialog>
    </Screen>
  );
}

export default function AdminTestimonials() {
  return (
    <>
      <Stack.Screen options={{ title: 'آراء العملاء' }} />
      <StaffGate adminOnly>
        <TestimonialsAdmin />
      </StaffGate>
    </>
  );
}

const styles = StyleSheet.create({
  stars: { flexDirection: 'row-reverse', gap: 4 },
});
