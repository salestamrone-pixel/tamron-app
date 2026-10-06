import { Stack } from 'expo-router';
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { Button, Chip, Dialog, Empty, ErrorText, Field, Loading, Muted, Row, Screen } from '@/components/kit';
import { QuoteCard } from '@/components/quote-card';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { logAudit } from '@/lib/audit';
import { STATUS_LABELS } from '@/constants/services';
import { QuoteRequest, QuoteStatus } from '@/types';

const STATUSES = Object.keys(STATUS_LABELS) as QuoteStatus[];

function Requests() {
  const [quotes, setQuotes] = useState<QuoteRequest[] | null>(null);
  const [editing, setEditing] = useState<QuoteRequest | null>(null);
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<QuoteStatus>('quoted');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'quoteRequests'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => setQuotes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QuoteRequest, 'id'>) }))),
      () => setQuotes([]),
    );
  }, []);

  const open = (quote: QuoteRequest) => {
    setEditing(quote);
    setPrice(quote.reply?.price ?? '');
    setNote(quote.reply?.note ?? '');
    setStatus(quote.status === 'new' ? 'quoted' : quote.status);
    setError('');
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'quoteRequests', editing.id), {
        status,
        reply: { price: price.trim(), note: note.trim(), repliedAt: serverTimestamp() },
      });
      await logAudit('رد على طلب عميل', `${editing.serviceName} · ${price.trim()}`);
      setEditing(null);
    } catch {
      setError('تعذر حفظ الرد.');
    } finally {
      setSaving(false);
    }
  };

  if (quotes === null) return <Loading />;
  if (quotes.length === 0) return <Empty title="لا توجد طلبات" message="ستظهر طلبات العملاء هنا فور إرسالها." />;

  return (
    <Screen>
      {quotes.map((quote) => (
        <QuoteCard key={quote.id} quote={quote}>
          <Muted>العميل: {quote.userName || '—'} · {quote.userEmail}</Muted>
          <Row>
            <Button label={quote.reply ? 'تعديل الرد' : 'الرد بعرض سعر'} onPress={() => open(quote)} />
            <Button label={`اتصال ${quote.phone}`} variant="outline" onPress={() => Linking.openURL(`tel:${quote.phone}`)} />
          </Row>
        </QuoteCard>
      ))}

      <Dialog visible={editing !== null} title="الرد على الطلب" message={editing?.serviceName} onClose={() => setEditing(null)}>
        <ErrorText>{error}</ErrorText>
        <Field label="السعر" placeholder="مثال: 1500 ريال شامل التركيب" value={price} onChangeText={setPrice} />
        <Field label="ملاحظات للعميل" value={note} onChangeText={setNote} multiline />
        <Row>
          {STATUSES.map((s) => (
            <Chip key={s} label={STATUS_LABELS[s].label} selected={status === s} onPress={() => setStatus(s)} />
          ))}
        </Row>
        <Button label="حفظ وإرسال" onPress={save} loading={saving} />
        <Button label="إلغاء" variant="outline" onPress={() => setEditing(null)} />
      </Dialog>
    </Screen>
  );
}

export default function AdminRequests() {
  return (
    <>
      <Stack.Screen options={{ title: 'طلبات العملاء' }} />
      <StaffGate adminOnly>
        <Requests />
      </StaffGate>
    </>
  );
}
