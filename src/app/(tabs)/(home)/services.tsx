import { useRouter } from 'expo-router';

import { ListItem, Muted, Screen } from '@/components/kit';
import { SERVICES } from '@/constants/services';

export default function ServicesScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Muted>اختر الخدمة لإرسال طلب عرض سعر.</Muted>
      {SERVICES.map((service) => (
        <ListItem
          key={service.id}
          icon={service.icon}
         
          title={service.name}
          subtitle={service.description}
          onPress={() => router.push({ pathname: '/request', params: { serviceId: service.id } })}
        />
      ))}
    </Screen>
  );
}
