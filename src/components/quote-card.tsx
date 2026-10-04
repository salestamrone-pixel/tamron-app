import { StyleSheet, View } from 'react-native';

import { Badge, Card, Muted, P, palette, Title } from '@/components/kit';
import { STATUS_LABELS } from '@/constants/services';
import { QuoteRequest } from '@/types';

export function formatDate(ts: { toDate: () => Date } | null | undefined, withTime = false) {
  if (!ts) return '';
  const d = ts.toDate();
  return withTime ? d.toLocaleString('ar') : d.toLocaleDateString('ar');
}

export function QuoteCard({ quote, children }: { quote: QuoteRequest; children?: React.ReactNode }) {
  const status = STATUS_LABELS[quote.status] ?? STATUS_LABELS.new;
  return (
    <Card>
      <Badge label={status.label} color={status.color} />
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
  reply: { backgroundColor: palette.tint, borderRadius: 12, padding: 12, gap: 4, marginTop: 6 },
});
