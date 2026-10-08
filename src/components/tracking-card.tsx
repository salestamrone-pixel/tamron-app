import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Badge, Button, Card, Dialog, ErrorText, Muted, P, palette, Title } from '@/components/kit';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { disableTracking, enableTracking, isTrackingOn, syncGeofences, trackingSupported } from '@/lib/tracking';
import { StaffMember, WorkSite } from '@/types';

async function loadSites() {
  const snap = await getDocs(collection(db, 'sites'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkSite, 'id'>) }));
}

export function TrackingCard({ staff }: { staff: StaffMember }) {
  const { isManager } = useAuth();
  const [on, setOn] = useState<boolean | null>(null);
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const profile = { email: staff.email, name: staff.name };

  useEffect(() => {
    if (!trackingSupported) return;
    isTrackingOn()
      .then(async (active) => {
        setOn(active);
        if (active) {
          // Sites may have changed since tracking was switched on.
          await syncGeofences(await loadSites());
        } else {
          // Usually already turned on right after login (see auto-tracking.ts); this
          // is a second, silent attempt in case that first one didn't go through.
          try {
            await enableTracking(profile, await loadSites());
            setOn(true);
          } catch {
            // Needs an explicit tap — surfaced below via the retry button.
          }
        }
      })
      .catch(() => setOn(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!trackingSupported || on === null) return null;

  const accept = async () => {
    setBusy(true);
    setError('');
    try {
      await enableTracking(profile, await loadSites());
      setOn(true);
      setAsking(false);
    } catch (e: any) {
      setError(e?.message ?? 'تعذر تفعيل التتبع.');
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    setBusy(true);
    try {
      await disableTracking(profile);
      setOn(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <Badge label={on ? 'التتبع يعمل' : 'التتبع متوقف'} color={on ? palette.success : palette.danger} />
      <Title>الحضور التلقائي وتتبع الموقع</Title>
      <Muted>
        {on
          ? 'يُسجَّل حضورك وانصرافك تلقائياً عند دخول موقع العمل والخروج منه، بدون الحاجة لفتح التطبيق أو الضغط على أي زر.'
          : 'يُفترض أن يكون هذا مفعّلاً تلقائياً. إذا ظهرت هذه الرسالة فلم تتم الموافقة على إذن الموقع بعد — اضغط الزر وامنح الإذن «طوال الوقت».'}
      </Muted>
      {on ? (
        isManager ? <Button label="إيقاف التتبع" variant="outline" onPress={stop} loading={busy} /> : null
      ) : (
        <Button label="تفعيل التتبع الآن" icon="navigate-circle-outline" onPress={() => setAsking(true)} />
      )}

      <Dialog visible={asking} icon="locate-outline" title="موافقة على تتبع الموقع" onClose={() => setAsking(false)}>
        <P>
          يجمع تطبيق تامرون بيانات موقعك الجغرافي لتسجيل الحضور والانصراف تلقائياً ولتمكين إدارة الشركة من معرفة
          موقعك، وذلك طوال الوقت: أثناء الدوام وخارجه، وحتى عند إغلاق التطبيق أو عدم استخدامه.
        </P>
        <Muted>
          تُحفظ المواقع في سجل تطّلع عليه إدارة الشركة فقط. سيظهر إشعار دائم على هاتفك ما دام التتبع يعمل
          {isManager ? '، ويمكنك إيقافه من هذه الصفحة في أي وقت.' : '.'}
        </Muted>
        <ErrorText>{error}</ErrorText>
        <Button label="موافق، فعّل التتبع" onPress={accept} loading={busy} />
        <Button label="غير موافق" variant="outline" onPress={() => setAsking(false)} />
      </Dialog>
    </Card>
  );
}
