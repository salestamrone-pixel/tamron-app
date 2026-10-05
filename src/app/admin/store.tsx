import { Stack } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Button, Card, Dialog, Empty, ErrorText, Field, Loading, Muted, P, Row, Screen, Title } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { Product } from '@/types';

function StoreAdmin() {
  const [items, setItems] = useState<Product[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Product | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return onSnapshot(collection(db, 'products'), (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }))),
    );
  }, []);

  const add = async () => {
    if (title.trim().length < 2) {
      setError('اكتب اسم المنتج أو العمل.');
      return;
    }
    if (imageUrl.trim() && !/^https:\/\//i.test(imageUrl.trim())) {
      setError('رابط الصورة لازم يبدأ بـ https://');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'products'), {
        title: title.trim(),
        description: description.trim(),
        price: price.trim(),
        imageUrl: imageUrl.trim(),
      });
      setAdding(false);
      setTitle('');
      setDescription('');
      setPrice('');
      setImageUrl('');
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
      <Button label="إضافة منتج أو عمل" icon="add-circle-outline" variant="gold" onPress={() => setAdding(true)} />
      {items.length === 0 ? <Empty icon="storefront-outline" title="المتجر فارغ" message="أضف أول منتج أو عمل ليظهر للعملاء في «متجرنا»." /> : null}
      {items.map((p) => (
        <Card key={p.id}>
          <Title>{p.title}</Title>
          {p.description ? <P>{p.description}</P> : null}
          {p.price ? <Muted>السعر: {p.price}</Muted> : null}
          <Row>
            <Button label="حذف" variant="danger" onPress={() => setRemoving(p)} />
          </Row>
        </Card>
      ))}

      <Dialog visible={adding} title="منتج جديد" onClose={() => setAdding(false)}>
        <ErrorText>{error}</ErrorText>
        <Field label="الاسم" value={title} onChangeText={setTitle} />
        <Field label="الوصف" value={description} onChangeText={setDescription} multiline />
        <Field label="السعر (اختياري)" placeholder="مثال: يبدأ من 500 ريال" value={price} onChangeText={setPrice} />
        <Field label="رابط الصورة (اختياري)" placeholder="https://..." value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" style={{ textAlign: 'left' }} />
        <Button label="حفظ" onPress={add} loading={saving} />
        <Button label="إلغاء" variant="outline" onPress={() => setAdding(false)} />
      </Dialog>

      <Dialog visible={removing !== null} title="حذف من المتجر" message={`حذف «${removing?.title ?? ''}»؟`} onClose={() => setRemoving(null)}>
        <Button
          label="حذف"
          variant="danger"
          onPress={async () => {
            if (removing) await deleteDoc(doc(db, 'products', removing.id));
            setRemoving(null);
          }}
        />
        <Button label="إلغاء" variant="outline" onPress={() => setRemoving(null)} />
      </Dialog>
    </Screen>
  );
}

export default function AdminStore() {
  return (
    <>
      <Stack.Screen options={{ title: 'إدارة المتجر' }} />
      <StaffGate adminOnly>
        <StoreAdmin />
      </StaffGate>
    </>
  );
}
