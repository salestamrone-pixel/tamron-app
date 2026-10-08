import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { font, Icon, palette } from '@/components/kit';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { QuoteMessage } from '@/types';

function formatTime(ts: QuoteMessage['createdAt']) {
  if (!ts) return '';
  return ts.toDate().toLocaleString('ar', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
}

// A lightweight back-and-forth thread on one quote request, so a customer and the
// company can clarify details without a phone call. No editing or deleting messages.
export function QuoteChat({ quoteId }: { quoteId: string }) {
  const { user, isAdmin, staff } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<QuoteMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!open) return;
    const q = query(collection(db, 'quoteRequests', quoteId, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QuoteMessage, 'id'>) }))));
  }, [open, quoteId]);

  const send = async () => {
    if (!user || text.trim().length === 0) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'quoteRequests', quoteId, 'messages'), {
        senderId: user.uid,
        senderRole: isAdmin ? 'admin' : 'customer',
        senderName: isAdmin ? staff?.name || 'الإدارة' : user.displayName || 'أنت',
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText('');
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } catch {
      // Not critical enough to block the rest of the screen with an error state.
    } finally {
      setSending(false);
    }
  };

  return (
    <View>
      <Pressable style={styles.toggle} onPress={() => setOpen((v) => !v)}>
        <Icon name="chatbubbles-outline" size={18} color={palette.goldDark} />
        <Text style={styles.toggleText}>{open ? 'إخفاء المحادثة' : 'المحادثة' + (messages.length > 0 ? ` (${messages.length})` : '')}</Text>
      </Pressable>
      {open ? (
        <View style={styles.wrap}>
          <ScrollView ref={scrollRef} style={styles.list} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
            {messages.length === 0 ? <Text style={styles.empty}>لا توجد رسائل بعد.</Text> : null}
            {messages.map((m) => (
              <View key={m.id} style={[styles.bubble, m.senderRole === 'admin' ? styles.bubbleAdmin : styles.bubbleCustomer]}>
                <Text style={styles.bubbleName}>{m.senderName}</Text>
                <Text style={styles.bubbleText}>{m.text}</Text>
                <Text style={styles.bubbleTime}>{formatTime(m.createdAt)}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.inputRow}>
            <Pressable onPress={send} disabled={sending || text.trim().length === 0} style={styles.sendBtn}>
              <Icon name="send" size={18} color="#fff" />
            </Pressable>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="اكتب رسالة..."
              placeholderTextColor="#A8A292"
              style={styles.input}
              multiline
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingVertical: 6 },
  toggleText: { fontSize: 13, fontFamily: font.bold, color: palette.goldDark },
  wrap: { gap: 8, marginTop: 4 },
  list: { maxHeight: 220, borderRadius: 14, backgroundColor: palette.surface, padding: 10 },
  empty: { fontSize: 12, fontFamily: font.regular, color: palette.muted, textAlign: 'center', paddingVertical: 10 },
  bubble: { maxWidth: '85%', borderRadius: 12, padding: 10, marginBottom: 8 },
  bubbleCustomer: { alignSelf: 'flex-end', backgroundColor: palette.tint },
  bubbleAdmin: { alignSelf: 'flex-start', backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border },
  bubbleName: { fontSize: 11, fontFamily: font.bold, color: palette.goldDark, textAlign: 'right' },
  bubbleText: { fontSize: 14, fontFamily: font.regular, color: palette.text, textAlign: 'right', marginTop: 2 },
  bubbleTime: { fontSize: 10, fontFamily: font.regular, color: palette.muted, textAlign: 'left', marginTop: 4 },
  inputRow: { flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 8 },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 90,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: palette.surface,
    fontSize: 14,
    fontFamily: font.regular,
    color: palette.text,
    textAlign: 'right',
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.gold },
});
