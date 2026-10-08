import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { Empty, Grid, Muted, SearchBar, Screen, Tile } from '@/components/kit';
import { SERVICES } from '@/constants/services';

export default function ServicesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return SERVICES;
    return SERVICES.filter((s) => s.name.includes(q));
  }, [query]);

  return (
    <Screen>
      <Muted>اختر الخدمة لإرسال طلب عرض سعر.</Muted>
      <SearchBar value={query} onChangeText={setQuery} placeholder="ابحث عن خدمة..." />
      {filtered.length === 0 ? (
        <Empty icon="search-outline" title="لا توجد نتائج" message="جرّب كلمة بحث مختلفة." />
      ) : (
        <Grid>
          {filtered.map((service) => (
            <Tile
              key={service.id}
              icon={service.icon}
              color={service.color}
              title={service.name}
              onPress={() => router.push({ pathname: '/request', params: { serviceId: service.id } })}
            />
          ))}
        </Grid>
      )}
    </Screen>
  );
}
