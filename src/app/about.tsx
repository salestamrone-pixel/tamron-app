import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Icon, IconName, Logo, Muted, P, palette, Screen, Section, Title, font } from '@/components/kit';
import { db } from '@/config/firebase';
import { downloadCompanyProfile } from '@/lib/profile-doc';
import { Testimonial } from '@/types';

function Stars({ value }: { value: number }) {
  return (
    <View style={{ flexDirection: 'row-reverse', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name={n <= value ? 'star' : 'star-outline'} size={14} color={palette.gold} />
      ))}
    </View>
  );
}

const VALUES: { title: string; text: string }[] = [
  { title: 'الجودة', text: 'نلتزم بتقديم أعمال عالية الجودة وفق أفضل المعايير.' },
  { title: 'الالتزام', text: 'نحرص على تنفيذ وتسليم المشاريع في الوقت المحدد بكل احترافية.' },
  { title: 'الإبداع', text: 'نبتكر حلولاً وتصاميم عصرية تناسب هوية كل عميل.' },
  { title: 'المصداقية', text: 'نبني علاقات طويلة المدى قائمة على الثقة والشفافية.' },
  { title: 'التميز', text: 'نسعى دائماً لتقديم أعمال تترك أثراً بصرياً قوياً ومميزاً.' },
  { title: 'التطوير المستمر', text: 'نواكب أحدث التقنيات والخامات في مجال الدعاية والإعلان.' },
];

const STRENGTHS: { icon: IconName; text: string }[] = [
  { icon: 'star-outline', text: 'خبرة ممتدة في المجال منذ عام 2001' },
  { icon: 'calendar-outline', text: 'الالتزام بالمواعيد وتسليم المشاريع' },
  { icon: 'people-outline', text: 'فريق عمل محترف ومتخصص' },
  { icon: 'ribbon-outline', text: 'جودة عالية في التصميم والتنفيذ' },
  { icon: 'construct-outline', text: 'استخدام أحدث التقنيات والخامات' },
  { icon: 'easel-outline', text: 'تنفيذ احترافي للوحات الداخلية والخارجية' },
  { icon: 'bulb-outline', text: 'حلول إبداعية تناسب هوية العميل' },
  { icon: 'headset-outline', text: 'خدمة عملاء ودعم مستمر' },
  { icon: 'pricetag-outline', text: 'أسعار تنافسية مع جودة متميزة' },
];

const FACTORY = [
  { icon: 'flash-outline', title: 'فايبر ليزر', text: 'قص وحفر دقيق على المعادن والمواسير بسرعة ودقة عالية.' },
  { icon: 'construct-outline', title: 'CNC هيدروليك', text: 'ثني وتشكيل الصاج بدقة باستخدام نظام تحكم رقمي.' },
  { icon: 'flame-outline', title: 'ليزر CO2', text: 'قص وحفر احترافي على المواد غير المعدنية والأكريليك والخشب.' },
  { icon: 'print-outline', title: 'طباعة رقمية', text: 'ماكينات Mimaki وRoland لطباعة وقص عالي الجودة.' },
] as const;

const CONTACT = {
  whatsapp: 'https://wa.me/966501556846',
  phones: ['0504215440', '0592886340', '0503948323'],
  unified: '920014652',
  email: 'sales@tamrone.sa',
  website: 'https://www.tamrone.sa',
  address: 'المملكة العربية السعودية، الرياض، طريق الخرج القديم، ص.ب 12662',
};

function ContactRow({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.contactBtn, pressed && { opacity: 0.6 }]}>
      <Icon name={icon} size={18} color={palette.goldDark} />
      <Text style={styles.contactText}>{label}</Text>
    </Pressable>
  );
}

export default function AboutScreen() {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => setTestimonials(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Testimonial, 'id'>) }))), () => {});
  }, []);

  const download = async () => {
    setDownloading(true);
    try {
      await downloadCompanyProfile();
    } catch {
      // Sharing can be cancelled by the user; nothing to report.
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'من نحن' }} />
      <Screen>
        <View style={styles.hero}>
          <Image source={require('@/assets/images/about-bg.jpg')} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient colors={['rgba(10,10,10,0.25)', 'rgba(10,10,10,0.75)']} style={StyleSheet.absoluteFill} />
          <Logo size={64} />
          <Text style={styles.heroTitle}>شركة تامرون العربية المحدودة</Text>
          <Text style={styles.heroSubtitle}>لتصميم وتنفيذ المشاريع الإعلانية</Text>
        </View>

        <Card>
          <Title>من نحن</Title>
          <P>
            شركة تامرون العربية المحدودة هي شركة سعودية متخصصة في التصميم والتنفيذ بمجال لوحات الدعاية والإعلان،
            تأسست عام 2023 بمدينة الرياض، وتمتد خبرات فريق العمل لدينا منذ عام 2001 في تنفيذ المشاريع الإعلانية
            بمختلف أنواعها وفق أعلى معايير الجودة والاحترافية.
          </P>
          <P>
            نؤمن بأن الهوية البصرية القوية هي أساس نجاح أي علامة تجارية، لذلك نقدّم حلولاً متكاملة تجمع بين الإبداع
            والدقة وجودة التنفيذ لنساعد عملاءنا على الظهور بصورة مميزة تعكس قوة علاماتهم التجارية.
          </P>
          <P>
            نعمل على تنفيذ كافة أعمال الدعاية والإعلان الداخلية والخارجية بأحدث التقنيات والمواد عالية الجودة، مع
            الالتزام بالمواعيد وتقديم أفضل الحلول التي تناسب احتياجات عملائنا داخل المملكة العربية السعودية.
          </P>
        </Card>

        <View style={styles.pair}>
          <Card style={{ flexGrow: 1, flexBasis: '47%' }}>
            <Icon name="eye-outline" size={26} color={palette.gold} />
            <Title>رؤيتنا</Title>
            <P>
              أن نكون الخيار الأول والرائد في تصميم وتنفيذ لوحات الدعاية والإعلان داخل المملكة العربية السعودية
              وخارجها، من خلال حلول إبداعية بمعايير جودة عالية تعكس قوة وتميز عملائنا.
            </P>
          </Card>
          <Card style={{ flexGrow: 1, flexBasis: '47%' }}>
            <Icon name="paper-plane-outline" size={26} color={palette.gold} />
            <Title>رسالتنا</Title>
            <P>
              تقديم خدمات احترافية تجمع بين الإبداع والدقة والالتزام، بما يسهم في تعزيز الهوية البصرية لعملائنا
              وتحقيق أفضل تأثير إعلاني بأحدث التقنيات وأعلى مستويات الجودة.
            </P>
          </Card>
        </View>

        <Section>قيمنا</Section>
        <View style={styles.grid3}>
          {VALUES.map((v) => (
            <Card key={v.title} style={styles.valueCard}>
              <Text style={styles.valueTitle}>{v.title}</Text>
              <Muted>{v.text}</Muted>
            </Card>
          ))}
        </View>

        <Section>نقاط قوتنا</Section>
        <Card>
          {STRENGTHS.map((s, i) => (
            <View key={s.text} style={[styles.strengthRow, i > 0 && styles.strengthSep]}>
              <Icon name={s.icon} size={20} color={palette.goldDark} />
              <Text style={styles.strengthText}>{s.text}</Text>
            </View>
          ))}
        </Card>

        <Section>مصنعنا وآلاتنا</Section>
        <P>
          نمتلك مصنعاً خاصاً مجهزاً بأحدث آلات القص والحفر والطباعة، فننفّذ أعمالنا بأنفسنا من التصميم حتى التركيب.
        </P>
        <View style={styles.grid2}>
          {FACTORY.map((f) => (
            <Card key={f.title} style={styles.factoryCard}>
              <Icon name={f.icon as IconName} size={24} color={palette.gold} />
              <Text style={styles.valueTitle}>{f.title}</Text>
              <Muted>{f.text}</Muted>
            </Card>
          ))}
        </View>

        {testimonials.length > 0 ? (
          <>
            <Section>آراء عملائنا</Section>
            <View style={styles.ratingSummary}>
              <Text style={styles.ratingValue}>
                {(testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)}
              </Text>
              <View style={{ gap: 2 }}>
                <Stars value={Math.round(testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length)} />
                <Muted>بناءً على {testimonials.length} {testimonials.length === 1 ? 'رأي' : 'رأي عميل'}</Muted>
              </View>
            </View>
            {testimonials.map((t) => (
              <Card key={t.id} style={{ gap: 6 }}>
                <Stars value={t.rating} />
                <P>{t.text}</P>
                <Text style={styles.valueTitle}>{t.name}</Text>
                {t.role ? <Muted>{t.role}</Muted> : null}
              </Card>
            ))}
          </>
        ) : null}

        <Section>تواصل معنا</Section>
        <Card>
          <ContactRow icon="logo-whatsapp" label="واتساب: 966501556846+" onPress={() => Linking.openURL(CONTACT.whatsapp)} />
          {CONTACT.phones.map((p) => (
            <ContactRow key={p} icon="call-outline" label={p} onPress={() => Linking.openURL(`tel:${p}`)} />
          ))}
          <ContactRow icon="headset-outline" label={`الرقم الموحد: ${CONTACT.unified}`} onPress={() => Linking.openURL(`tel:${CONTACT.unified}`)} />
          <ContactRow icon="mail-outline" label={CONTACT.email} onPress={() => Linking.openURL(`mailto:${CONTACT.email}`)} />
          <ContactRow icon="globe-outline" label="www.tamrone.sa" onPress={() => Linking.openURL(CONTACT.website)} />
          <ContactRow icon="location-outline" label={CONTACT.address} onPress={() => Linking.openURL('https://maps.google.com/?q=' + encodeURIComponent(CONTACT.address))} />
        </Card>

        <Button
          label="تحميل الملف التعريفي الكامل (PDF)"
          icon="download-outline"
          variant="dark"
          onPress={download}
          loading={downloading}
        />
        <Button label="اطلب عرض سعر" icon="arrow-back" variant="gold" onPress={() => router.push('/services')} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 30,
    overflow: 'hidden',
    minHeight: 220,
    padding: 24,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 4,
  },
  heroTitle: { color: '#fff', fontSize: 22, fontFamily: font.black, textAlign: 'right', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 6 },
  heroSubtitle: { color: palette.goldLight, fontSize: 14, fontFamily: font.medium, textAlign: 'right' },
  pair: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  grid3: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 },
  valueCard: { flexGrow: 1, flexBasis: '31%', gap: 4, padding: 14 },
  valueTitle: { fontSize: 15, fontFamily: font.bold, color: palette.text, textAlign: 'right' },
  grid2: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  factoryCard: { flexGrow: 1, flexBasis: '47%', gap: 4 },
  strengthRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 10 },
  strengthSep: { borderTopWidth: 1, borderTopColor: palette.border },
  strengthText: { flex: 1, fontSize: 14, fontFamily: font.medium, color: palette.text, textAlign: 'right' },
  contactBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 9 },
  contactText: { fontSize: 14, fontFamily: font.bold, color: palette.text, textAlign: 'right', flex: 1 },
  ratingSummary: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  ratingValue: { fontSize: 32, fontFamily: font.black, color: palette.goldDark },
});
