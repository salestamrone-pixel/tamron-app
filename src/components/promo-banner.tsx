import { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { font, Icon, IconName, palette } from '@/components/kit';

export interface PromoSlide {
  key: string;
  icon: IconName;
  title: string;
  subtitle: string;
  cta: string;
  onPress: () => void;
}

// A swipeable strip of highlights above the main icons: services, quotes, the store, order
// tracking... Scrolling is the user's own finger, nothing auto-plays or loops on its own.
export function PromoBanner({ slides }: { slides: PromoSlide[] }) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width, 720) - 36;
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    setIndex(Math.max(0, Math.min(slides.length - 1, i)));
  };

  if (slides.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        contentContainerStyle={styles.track}
        onMomentumScrollEnd={onScrollEnd}>
        {slides.map((s) => (
          <Pressable key={s.key} onPress={s.onPress} style={({ pressed }) => [styles.card, { width: cardWidth }, pressed && { opacity: 0.85 }]}>
            <View style={styles.badge}>
              <Icon name={s.icon} size={26} color={palette.gold} />
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end', gap: 3 }}>
              <Text style={styles.title} numberOfLines={1}>{s.title}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>{s.subtitle}</Text>
              <View style={styles.ctaRow}>
                <Text style={styles.ctaText}>{s.cta}</Text>
                <Icon name="arrow-back" size={14} color={palette.goldLight} />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      {slides.length > 1 ? (
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  track: { gap: 12, paddingHorizontal: 0 },
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
    minHeight: 92,
    borderRadius: 24,
    padding: 16,
    backgroundColor: 'rgba(10,10,10,0.62)',
    borderWidth: 1.5,
    borderColor: 'rgba(204,167,65,0.55)',
    boxShadow: '0 10px 22px rgba(0,0,0,0.35)',
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.ink,
    borderWidth: 1.5,
    borderColor: palette.gold,
  },
  title: { fontSize: 16, fontFamily: font.black, color: '#fff' },
  subtitle: { fontSize: 12, fontFamily: font.medium, color: '#D9C78F', lineHeight: 17, textAlign: 'right' },
  ctaRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 2 },
  ctaText: { fontSize: 12, fontFamily: font.bold, color: palette.goldLight },
  dots: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: palette.gold, width: 18 },
});
