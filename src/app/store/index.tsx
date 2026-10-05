import { Stack, useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Empty, font, Icon, Loading, Muted, palette, Screen, Title } from '@/components/kit';
import { db } from '@/config/firebase';
import { Product } from '@/types';

export default function StoreScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Product[] | null>(null);

  useEffect(() => {
    return onSnapshot(
      collection(db, 'products'),
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }))),
      () => setItems([]),
    );
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'متجرنا' }} />
      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty icon="storefront-outline" title="متجرنا قريباً" message="سنعرض هنا أعمالنا ومنتجاتنا. يمكنك في الأثناء طلب عرض سعر لأي خدمة." />
      ) : (
        <Screen>
          <View style={styles.grid}>
            {items.map((p) => (
              <Card key={p.id} style={styles.card}>
                {p.imageUrl ? (
                  <Image source={{ uri: p.imageUrl }} style={styles.image} />
                ) : (
                  <View style={[styles.image, styles.placeholder]}>
                    <Icon name="image-outline" size={34} color={palette.gold} />
                  </View>
                )}
                <Title>{p.title}</Title>
                {p.description ? <Muted>{p.description}</Muted> : null}
                {p.price ? <Text style={styles.price}>{p.price}</Text> : null}
                <Button
                  label="اطلب هذا العمل"
                  icon="arrow-back"
                  onPress={() => router.push({ pathname: '/request', params: { serviceId: 'other', product: p.title } })}
                />
              </Card>
            ))}
          </View>
        </Screen>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 14 },
  card: { padding: 12 },
  image: { width: '100%', height: 170, borderRadius: 18, backgroundColor: '#F2F0EA' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  price: { fontSize: 16, fontFamily: font.black, color: palette.goldDark, textAlign: 'right' },
});
