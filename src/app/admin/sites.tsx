import { Stack } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { Button, Card, Dialog, ErrorText, Field, Loading, Muted, Row, Screen, Title } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { getCurrentPoint, mapsUrl } from '@/lib/geo';
import { WorkSite } from '@/types';

function Sites() {
  const [sites, setSites] = useState<WorkSite[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<WorkSite | null>(null);
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState('100');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return onSnapshot(collection(db, 'sites'), (snap) =>
      setSites(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkSite, 'id'>) }))),
    );
  }, []);

  const useMyLocation = async () => {
    setBusy(true);
    try {
      const p = await getCurrentPoint();
      setLat(String(p.lat));
      setLng(String(p.lng));
      setError('');
    } catch (e: any) {
      setError(e?.message ?? 'تعذر تحديد الموقع.');
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    const la = Number(lat);
    const ln = Number(lng);
    const r = Number(radius);
    if (!name.trim() || !lat || !lng || !Number.isFinite(la) || !Number.isFinite(ln) || Math.abs(la) > 90 || Math.abs(ln) > 180) {
      setError('اكتب اسم الموقع وإحداثيات صحيحة.');
      return;
    }
    if (!Number.isFinite(r) || r < 30 || r > 5000) {
      setError('نصف القطر يجب أن يكون بين 30 و5000 متر.');
      return;
    }
    setBusy(true);
    try {
      await addDoc(collection(db, 'sites'), { name: name.trim(), lat: la, lng: ln, radius: r });
      setAdding(false);
      setName('');
      setLat('');
      setLng('');
      setRadius('100');
      setError('');
    } catch {
      setError('تعذر الحفظ.');
    } finally {
      setBusy(false);
    }
  };

  if (sites === null) return <Loading />;

  return (
    <Screen>
      <Button label="إضافة موقع عمل" onPress={() => setAdding(true)} />
      <Muted>الموظف لا يستطيع تسجيل الحضور إلا وهو داخل نصف قطر أحد هذه المواقع.</Muted>

      {sites.map((site) => (
        <Card key={site.id}>
          <Title>{site.name}</Title>
          <Muted>نصف القطر: {site.radius} متر</Muted>
          <Row>
            <Button label="عرض على الخريطة" variant="outline" onPress={() => Linking.openURL(mapsUrl(site))} />
            <Button label="حذف" variant="danger" onPress={() => setRemoving(site)} />
          </Row>
        </Card>
      ))}

      <Dialog visible={adding} title="موقع عمل جديد" onClose={() => setAdding(false)}>
        <ErrorText>{error}</ErrorText>
        <Field label="اسم الموقع" placeholder="مثال: المصنع" value={name} onChangeText={setName} />
        <Button label="استخدم موقعي الحالي" variant="outline" onPress={useMyLocation} loading={busy} />
        <Field label="خط العرض (Latitude)" value={lat} onChangeText={setLat} keyboardType="numeric" style={{ textAlign: 'left' }} />
        <Field label="خط الطول (Longitude)" value={lng} onChangeText={setLng} keyboardType="numeric" style={{ textAlign: 'left' }} />
        <Field label="نصف القطر بالمتر" value={radius} onChangeText={setRadius} keyboardType="numeric" style={{ textAlign: 'left' }} />
        <Button label="حفظ" onPress={add} loading={busy} />
        <Button label="إلغاء" variant="outline" onPress={() => setAdding(false)} />
      </Dialog>

      <Dialog visible={removing !== null} title="حذف الموقع" message={`حذف «${removing?.name ?? ''}»؟`} onClose={() => setRemoving(null)}>
        <Button
          label="حذف"
          variant="danger"
          onPress={async () => {
            if (removing) await deleteDoc(doc(db, 'sites', removing.id));
            setRemoving(null);
          }}
        />
        <Button label="إلغاء" variant="outline" onPress={() => setRemoving(null)} />
      </Dialog>
    </Screen>
  );
}

export default function AdminSites() {
  return (
    <>
      <Stack.Screen options={{ title: 'مواقع العمل' }} />
      <StaffGate adminOnly>
        <Sites />
      </StaffGate>
    </>
  );
}
