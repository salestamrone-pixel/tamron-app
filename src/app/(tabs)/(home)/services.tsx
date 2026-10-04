import { useRouter } from 'expo-router';

import { Card, Muted, Screen, Title } from '@/components/kit';
import { SERVICES } from '@/constants/services';

export default function ServicesScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Muted>اختر الخدمة لإرسال طلب عرض سعر.</Muted>
      {SERVICES.map((service) => (
        <Card
          key={service.id}
          onPress={() => router.push({ pathname: '/request', params: { serviceId: service.id } })}>
          <Title>{service.name}</Title>
          <Muted>{service.description}</Muted>
        </Card>
      ))}
    </Screen>
  );
}
