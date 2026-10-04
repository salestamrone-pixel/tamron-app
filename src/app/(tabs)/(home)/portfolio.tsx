import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, StyleSheet } from 'react-native';

import { Card, Empty, Loading, Muted, Screen, Title } from '@/components/kit';
import { db } from '@/config/firebase';
import { PortfolioItem } from '@/types';

export default function PortfolioScreen() {
  const [items, setItems] = useState<PortfolioItem[] | null>(null);

  useEffect(() => {
    getDocs(collection(db, 'portfolio'))
      .then((snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PortfolioItem, 'id'>) }))))
      .catch(() => setItems([]));
  }, []);

  if (items === null) return <Loading />;
  if (items.length === 0) {
    return <Empty title="قريباً" message="سيتم إضافة نماذج من أعمالنا هنا." />;
  }

  return (
    <Screen>
      {items.map((item) => (
        <Card key={item.id}>
          {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} /> : null}
          <Title>{item.title}</Title>
          <Muted>{item.description}</Muted>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#e2e8f0' },
});
