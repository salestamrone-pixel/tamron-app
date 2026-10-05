import { useRouter } from 'expo-router';

import { Grid, Muted, Screen, Tile } from '@/components/kit';
import { SERVICES } from '@/constants/services';

export default function ServicesScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Muted>اختر الخدمة لإرسال طلب عرض سعر.</Muted>
      <Grid>
        {SERVICES.map((service) => (
          <Tile
            key={service.id}
            icon={service.icon}
            color={service.color}
            title={service.name}
            onPress={() => router.push({ pathname: '/request', params: { serviceId: service.id } })}
          />
        ))}
      </Grid>
    </Screen>
  );
}
