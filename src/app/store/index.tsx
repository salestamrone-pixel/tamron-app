import { Stack, useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Chip, Empty, font, Icon, Muted, palette, Row, Screen, SearchBar, SkeletonGrid, Title } from '@/components/kit';
import { db } from '@/config/firebase';
import { Product } from '@/types';

export default function StoreScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Product[] | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | 'all'>('all');

  useEffect(() => {
    return onSnapshot(
      collection(db, 'products'),
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }))),
      () => setItems([]),
    );
  }, []);

  const categories = useMemo(() => {
    if (!items) return [];
    return Array.from(new Set(items.map((p) => p.category).filter((c): c is string => !!c)));
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return items;
    const q = query.trim();
    return items.filter((p) => {
      const matchesQuery = !q || p.title.includes(q) || p.description?.includes(q);
      const matchesCategory = category === 'all' || p.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [items, query, category]);

  return (
    <>
      <Stack.Screen options={{ title: 'متجرنا' }} />
      {items === null ? (
        <Screen>
          <SkeletonGrid />
        </Screen>
      ) : items.length === 0 ? (
        <Empty icon="storefront-outline" title="متجرنا قريباً" message="سنعرض هنا أعمالنا ومنتجاتنا. يمكنك في الأثناء طلب عرض سعر لأي خدمة." />
      ) : (
        <Screen>
          <SearchBar value={query} onChangeText={setQuery} placeholder="ابحث في المتجر..." />
          {categories.length > 0 ? (
            <Row>
              <Chip label="الكل" selected={category === 'all'} onPress={() => setCategory('all')} />
              {categories.map((c) => (
                <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
              ))}
            </Row>
          ) : null}
          {filtered && filtered.length === 0 ? (
            <Empty icon="search-outline" title="لا توجد نتائج" message="جرّب كلمة بحث مختلفة." />
          ) : null}
          <View style={styles.grid}>
            {filtered?.map((p) => (
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
                <View style={styles.actions}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="اطلب هذا العمل"
                      icon="arrow-back"
                      onPress={() => router.push({ pathname: '/request', params: { serviceId: 'other', product: p.title } })}
                    />
                  </View>
                  <Pressable
                    onPress={() => Share.share({ message: `${p.title} - شركة تامرون العربية المحدودة\nhttps://www.tamrone.sa` })}
                    style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.7 }]}>
                    <Icon name="share-social-outline" size={20} color={palette.goldDark} />
                  </Pressable>
                </View>
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
  actions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  shareBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
});
