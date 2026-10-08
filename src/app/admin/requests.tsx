import { Stack } from 'expo-router';
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import { Button, Chip, Dialog, Empty, ErrorText, Field, Icon, Loading, Muted, palette, Row, Screen } from '@/components/kit';
import { QuoteCard } from '@/components/quote-card';
import { QuoteChat } from '@/components/quote-chat';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { logAudit } from '@/lib/audit';
import { pickImages, uploadPortfolioImage } from '@/lib/attachments';
import { STATUS_LABELS } from '@/constants/services';
import { QuoteRequest, QuoteStatus } from '@/types';

const STATUSES = Object.keys(STATUS_LABELS) as QuoteStatus[];

function Requests() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteRequest[] | null>(null);
  const [filter, setFilter] = useState<QuoteStatus | 'all'>('all');
  const [editing, setEditing] = useState<QuoteRequest | null>(null);
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<QuoteStatus>('quoted');
  const [portfolioImage, setPortfolioImage] = useState<string | null>(null);
  const [pickingPortfolio, setPickingPortfolio] = useState(false);
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

  const filtered = useMemo(() => {
    if (!quotes) return quotes;
    return filter === 'all' ? quotes : quotes.filter((q) => q.status === filter);
  }, [quotes, filter]);

  const open = (quote: QuoteRequest) => {
    setEditing(quote);
    setPrice(quote.reply?.price ?? '');
    setNote(quote.reply?.note ?? '');
    setStatus(quote.status === 'new' ? 'quoted' : quote.status);
    setPortfolioImage(null);
    setError('');
  };

  const pickPortfolioPhoto = async () => {
    if (!user) return;
    setPickingPortfolio(true);
    try {
      const [uri] = await pickImages(1);
      if (uri) setPortfolioImage(uri);
    } finally {
      setPickingPortfolio(false);
    }
  };

  const save = async () => {
    if (!editing || !user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'quoteRequests', editing.id), {
        status,
        reply: { price: price.trim(), note: note.trim(), repliedAt: serverTimestamp() },
      });
      await logAudit('رد على طلب عميل', `${editing.serviceName} · ${price.trim()}`);
      if (status === 'done' && portfolioImage) {
        const imageUrl = await uploadPortfolioImage(user.uid, portfolioImage);
        await addDoc(collection(db, 'portfolio'), { title: editing.serviceName, description: editing.details, imageUrl });
      }
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
      <Row>
        <Chip label="الكل" selected={filter === 'all'} onPress={() => setFilter('all')} />
        {STATUSES.map((s) => (
          <Chip key={s} label={STATUS_LABELS[s].label} selected={filter === s} onPress={() => setFilter(s)} />
        ))}
      </Row>
      {filtered && filtered.length === 0 ? <Empty icon="filter-outline" title="لا توجد طلبات بهذه الحالة" /> : null}
      {filtered?.map((quote) => (
        <QuoteCard key={quote.id} quote={quote}>
          <Muted>العميل: {quote.userName || '—'} · {quote.userEmail}</Muted>
          <Row>
            <Button label={quote.reply ? 'تعديل الرد' : 'الرد بعرض سعر'} onPress={() => open(quote)} />
            <Button label={`اتصال ${quote.phone}`} variant="outline" onPress={() => Linking.openURL(`tel:${quote.phone}`)} />
          </Row>
          <QuoteChat quoteId={quote.id} />
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
        {status === 'done' ? (
          <>
            <Muted>صورة للعمل المنجز (اختياري، تُضاف لمعرض الأعمال)</Muted>
            <View style={styles.portfolioRow}>
              {portfolioImage ? <Image source={{ uri: portfolioImage }} style={styles.portfolioThumb} /> : null}
              <Pressable style={styles.portfolioBtn} onPress={pickPortfolioPhoto} disabled={pickingPortfolio}>
                <Icon name="camera-outline" size={20} color={palette.goldDark} />
              </Pressable>
            </View>
          </>
        ) : null}
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

const styles = StyleSheet.create({
  portfolioRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  portfolioThumb: { width: 72, height: 72, borderRadius: 14 },
  portfolioBtn: {
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
