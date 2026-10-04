import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Button, Empty, Loading, Screen } from '@/components/kit';
import { QuoteCard } from '@/components/quote-card';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { QuoteRequest } from '@/types';

export default function OrdersScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteRequest[] | null>(null);

  useEffect(() => {
    if (!user) {
      setQuotes(null);
      return;
    }
    const q = query(collection(db, 'quoteRequests'), where('userId', '==', user.uid));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QuoteRequest, 'id'>) }));
        list.sort((a, b) => (b.createdAt?.toMillis() ?? Date.now()) - (a.createdAt?.toMillis() ?? Date.now()));
        setQuotes(list);
      },
      () => setQuotes([]),
    );
  }, [user]);

  if (loading) return <Loading />;

  if (!user) {
    return (
      <Empty icon="clipboard-text-outline" title="طلباتي" message="سجّل الدخول لعرض طلباتك وردود الشركة عليها.">
        <Button label="تسجيل الدخول" onPress={() => router.push('/auth/login')} />
      </Empty>
    );
  }

  if (quotes === null) return <Loading />;

  if (quotes.length === 0) {
    return (
      <Empty icon="clipboard-plus-outline" title="لا توجد طلبات بعد" message="أرسل أول طلب عرض سعر من قائمة الخدمات.">
        <Button label="استعرض الخدمات" onPress={() => router.push('/services')} />
      </Empty>
    );
  }

  return (
    <Screen>
      {quotes.map((quote) => (
        <QuoteCard key={quote.id} quote={quote} />
      ))}
    </Screen>
  );
}
