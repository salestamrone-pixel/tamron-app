import { useRouter } from 'expo-router';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Button, Dialog, Empty, Loading, Row, Screen } from '@/components/kit';
import { QuoteCard } from '@/components/quote-card';
import { QuoteChat } from '@/components/quote-chat';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { QuoteRequest } from '@/types';

export default function OrdersScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteRequest[] | null>(null);
  const [cancelling, setCancelling] = useState<QuoteRequest | null>(null);

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
      <Empty icon="document-text-outline" title="طلباتي" message="سجّل الدخول لعرض طلباتك وردود الشركة عليها.">
        <Button label="تسجيل الدخول" onPress={() => router.push('/auth/login')} />
      </Empty>
    );
  }

  if (quotes === null) return <Loading />;

  if (quotes.length === 0) {
    return (
      <Empty icon="add-circle-outline" title="لا توجد طلبات بعد" message="أرسل أول طلب عرض سعر من قائمة الخدمات.">
        <Button label="استعرض الخدمات" onPress={() => router.push('/services')} />
      </Empty>
    );
  }

  const cancel = async () => {
    if (!cancelling) return;
    await updateDoc(doc(db, 'quoteRequests', cancelling.id), { status: 'cancelled' });
    setCancelling(null);
  };

  return (
    <Screen>
      {quotes.map((quote) => {
        const editable = quote.status === 'new' && !quote.reply;
        return (
          <QuoteCard key={quote.id} quote={quote}>
            {editable ? (
              <Row>
                <Button label="تعديل الطلب" variant="outline" onPress={() => router.push({ pathname: '/request', params: { editId: quote.id } })} />
                <Button label="إلغاء الطلب" variant="danger" onPress={() => setCancelling(quote)} />
              </Row>
            ) : quote.status !== 'cancelled' ? (
              <Button
                label="اطلب نفس الشيء تاني"
                icon="refresh-outline"
                variant="outline"
                onPress={() => router.push({ pathname: '/request', params: { repeatFrom: quote.id } })}
              />
            ) : null}
            <QuoteChat quoteId={quote.id} />
          </QuoteCard>
        );
      })}

      <Dialog visible={cancelling !== null} title="إلغاء الطلب" message="هل تريد إلغاء هذا الطلب؟ لن تقدر تتراجع." onClose={() => setCancelling(null)}>
        <Button label="تأكيد الإلغاء" variant="danger" onPress={cancel} />
        <Button label="تراجع" variant="outline" onPress={() => setCancelling(null)} />
      </Dialog>
    </Screen>
  );
}
