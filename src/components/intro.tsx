import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { font, palette } from '@/components/kit';

const WORDS = [
  { text: 'شركة', x: -170, y: -50 },
  { text: 'تامرون', x: 170, y: -70 },
  { text: 'العربية', x: -150, y: 70 },
  { text: 'المحدودة', x: 160, y: 60 },
];

const TOTAL_MS = 7000;

// One-time 7 second opening: logo, the company name flying in word by word, then the registration numbers.
export function Intro({ onDone }: { onDone: () => void }) {
  const logo = useRef(new Animated.Value(0)).current;
  const words = useRef(WORDS.map(() => new Animated.Value(0))).current;
  const info = useRef(new Animated.Value(0)).current;
  const out = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(logo, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }).start();
    words.forEach((v, i) =>
      Animated.timing(v, { toValue: 1, duration: 1000, delay: 900 + i * 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(),
    );
    Animated.timing(info, { toValue: 1, duration: 900, delay: 3300, useNativeDriver: true }).start();
    const fade = setTimeout(() => {
      Animated.timing(out, { toValue: 0, duration: 400, useNativeDriver: true }).start(({ finished }) => finished && onDone());
    }, TOTAL_MS - 400);
    return () => clearTimeout(fade);
  }, [info, logo, onDone, out, words]);

  return (
    <Animated.View style={[styles.root, { opacity: out }]}>
      <View style={styles.center}>
        <Animated.View style={{ opacity: logo, transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        <View style={styles.words}>
          {WORDS.map((w, i) => (
            <Animated.Text
              key={w.text}
              style={[
                styles.word,
                {
                  opacity: words[i],
                  transform: [
                    { translateX: words[i].interpolate({ inputRange: [0, 1], outputRange: [w.x, 0] }) },
                    { translateY: words[i].interpolate({ inputRange: [0, 1], outputRange: [w.y, 0] }) },
                  ],
                },
              ]}>
              {w.text}
            </Animated.Text>
          ))}
        </View>
        <Animated.View style={[styles.info, { opacity: info }]}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>الرقم الضريبي</Text>
            <Text style={styles.infoValue}>311524490100003</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>السجل التجاري</Text>
            <Text style={styles.infoValue}>1010853768</Text>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill as object, backgroundColor: '#000', zIndex: 100, elevation: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22, paddingHorizontal: 20 },
  logo: { width: 190, height: 190 },
  words: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 10, minHeight: 44 },
  word: { fontSize: 28, fontFamily: font.black, color: palette.goldLight },
  info: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  infoCol: { alignItems: 'center', gap: 4 },
  infoLabel: { fontSize: 12, fontFamily: font.medium, color: '#BDB59D' },
  infoValue: { fontSize: 15, fontFamily: font.bold, color: '#fff', letterSpacing: 1 },
});
