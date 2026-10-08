import { Stack } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Button, Card, Chip, Dialog, Empty, ErrorText, Field, Loading, Muted, P, Row, Screen, Title } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { pickImages, uploadStoreImage } from '@/lib/attachments';
import { Product } from '@/types';

const SUGGESTED_CATEGORIES = ['بنرات', 'لوحات', 'أعمال معدنية', 'هدايا دعائية', 'أخرى'];

function StoreAdmin() {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Product | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const pickAndUpload = async () => {
    if (!user) return;
    setUploading(true);
    try {
      const [uri] = await pickImages(1);
      if (!uri) return;
      const url = await uploadStoreImage(user.uid, uri);
      setImageUrl(url);
    } catch {
      setError('تعذر رفع الصورة.');
    } finally {
      setUploading(false);
    }
  };

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
        category: category.trim(),
        imageUrl: imageUrl.trim(),
      });
      setAdding(false);
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
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
          {p.category ? <Muted>{p.category}</Muted> : null}
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
        <Muted>التصنيف (اختياري)</Muted>
        <Row>
          {SUGGESTED_CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </Row>
        <Field label="أو تصنيف مخصص" value={category} onChangeText={setCategory} />
        {imageUrl ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUrl }} style={styles.preview} />
          </View>
        ) : null}
        <Button label={imageUrl ? 'تغيير الصورة' : 'رفع صورة من الجهاز'} icon="camera-outline" variant="outline" onPress={pickAndUpload} loading={uploading} />
        <Field label="أو رابط الصورة (اختياري)" placeholder="https://..." value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" style={{ textAlign: 'left' }} />
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

const styles = StyleSheet.create({
  previewWrap: { alignItems: 'flex-end' },
  preview: { width: 100, height: 100, borderRadius: 14 },
});
