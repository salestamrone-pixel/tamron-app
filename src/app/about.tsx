import { Stack, useRouter } from 'expo-router';

import { Button, Card, Hero, ListItem, P, Screen, Section, Title } from '@/components/kit';
import { SERVICES } from '@/constants/services';

const FACTORY = [
  { icon: 'flash-outline', title: 'فايبر ليزر', text: 'قص وحفر دقيق على المعادن وغيرها.' },
  { icon: 'construct-outline', title: 'CNC', text: 'حفر وقص بماكينة CNC.' },
  { icon: 'flame-outline', title: 'ليزر CO2', text: 'قص وحفر المواد غير المعدنية.' },
  { icon: 'sync-outline', title: 'درفلة وطعاجة', text: 'أعمال الدرفيل والثني.' },
] as const;

export default function AboutScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'من نحن' }} />
      <Screen>
        <Hero logo title="شركة تامرون العربية المحدودة" subtitle="شركة دعاية وإعلان ولها مصنع خاص للحفر والقص." />

        <Card>
          <Title>من نحن</Title>
          <P>
            شركة تامرون العربية المحدودة متخصصة في الدعاية والإعلان: نصمم وننفذ البنرات والستيكرات ولوحات البايلون
            واليوني بول، ولوحات وواجهات المحلات التجارية، والأسوار الدعائية لمواقع المشاريع.
          </P>
          <P>
            ولدينا مصنع خاص مجهز بماكينات الفايبر ليزر وCNC وليزر CO2 والدرفلة والطعاجة، فنصنّع أعمالنا بأنفسنا من
            التصميم حتى التركيب.
          </P>
        </Card>

        <Section>خدماتنا</Section>
        {SERVICES.filter((s) => s.id !== 'other').map((s) => (
          <ListItem
            key={s.id}
            icon={s.icon}
            color={s.color}
            title={s.name}
            subtitle={s.description}
            onPress={() => router.push({ pathname: '/request', params: { serviceId: s.id } })}
          />
        ))}

        <Section>مصنعنا</Section>
        {FACTORY.map((f) => (
          <ListItem key={f.title} icon={f.icon} title={f.title} subtitle={f.text} />
        ))}

        <Button label="اطلب عرض سعر" icon="arrow-back" variant="gold" onPress={() => router.push('/services')} />
      </Screen>
    </>
  );
}
