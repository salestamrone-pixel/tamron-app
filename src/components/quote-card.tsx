import { StyleSheet, Text, View } from 'react-native';

import { Badge, Card, font, Muted, P, palette, Title } from '@/components/kit';
import { STATUS_LABELS } from '@/constants/services';
import { QuoteRequest, QuoteStatus } from '@/types';

export function formatDate(ts: { toDate: () => Date } | null | undefined, withTime = false) {
  if (!ts) return '';
  const d = ts.toDate();
  return withTime ? d.toLocaleString('ar') : d.toLocaleDateString('ar');
}

const STEPS: { key: QuoteStatus; label: string }[] = [
  { key: 'new', label: 'استلمنا طلبك' },
  { key: 'quoted', label: 'عرض السعر' },
  { key: 'in_progress', label: 'التنفيذ' },
  { key: 'done', label: 'التسليم' },
];

function Steps({ status }: { status: QuoteStatus }) {
  if (status === 'cancelled') return null;
  const current = STEPS.findIndex((s) => s.key === status);
  return (
    <View style={styles.steps}>
      {STEPS.map((s, i) => (
        <View key={s.key} style={styles.step}>
          <View style={[styles.bar, i <= current && styles.barOn]} />
          <Text style={[styles.stepLabel, i <= current && { color: palette.text }]}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function QuoteCard({ quote, children }: { quote: QuoteRequest; children?: React.ReactNode }) {
  const status = STATUS_LABELS[quote.status] ?? STATUS_LABELS.new;
  return (
    <Card>
      <Badge label={status.label} color={status.color} />
      <Steps status={quote.status} />
      <Title>{quote.serviceName}</Title>
      <P>{quote.details}</P>
      {quote.dimensions ? <Muted>المقاسات: {quote.dimensions}</Muted> : null}
      {quote.quantity ? <Muted>الكمية: {quote.quantity}</Muted> : null}
      {quote.location ? <Muted>الموقع: {quote.location}</Muted> : null}
      <Muted>{formatDate(quote.createdAt)}</Muted>
      {quote.reply ? (
        <View style={styles.reply}>
          <Title>رد الشركة</Title>
          {quote.reply.price ? <P>السعر: {quote.reply.price}</P> : null}
          {quote.reply.note ? <P>{quote.reply.note}</P> : null}
        </View>
      ) : null}
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  steps: { flexDirection: 'row-reverse', gap: 6, marginVertical: 6 },
  step: { flex: 1, gap: 4 },
  bar: { height: 5, borderRadius: 3, backgroundColor: '#E7E1CF' },
  barOn: { backgroundColor: palette.gold },
  stepLabel: { fontSize: 10, fontFamily: font.medium, color: palette.muted, textAlign: 'center' },
  reply: { backgroundColor: palette.tint, borderRadius: 12, padding: 12, gap: 4, marginTop: 6 },
});
