import { Stack } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Card, ListItem, Loading, Muted, Screen, Title } from '@/components/kit';
import { StaffGate } from '@/components/staff-gate';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { employmentLetterHtml, salaryCertificateHtml, sharePdf } from '@/lib/pdf';
import { StaffMember } from '@/types';

function Documents({ email }: { email: string }) {
  const [member, setMember] = useState<StaffMember | null>(null);
  useEffect(() => {
    getDoc(doc(db, 'staff', email)).then((s) => s.exists() && setMember(s.data() as StaffMember));
  }, [email]);

  if (!member) return <Loading />;

  return (
    <Screen>
      <Card>
        <Title>{member.name}</Title>
        <Muted>{member.jobTitle || 'موظف'}</Muted>
      </Card>
      <ListItem icon="cash-outline" title="شهادة تعريف بالراتب" subtitle="PDF بشعار الشركة وبياناتها" onPress={() => sharePdf(salaryCertificateHtml(member))} />
      <ListItem icon="document-text-outline" title="خطاب تعريف بالموظف" subtitle="للجهات التي تطلب إثبات العمل" onPress={() => sharePdf(employmentLetterHtml(member))} />
      <Muted>تأكد من اكتمال بياناتك (الراتب، تاريخ التعيين، رقم الهوية) عند الإدارة قبل استخراج الوثائق.</Muted>
    </Screen>
  );
}

export default function StaffDocuments() {
  const { staff } = useAuth();
  return (
    <>
      <Stack.Screen options={{ title: 'مستنداتي' }} />
      <StaffGate>{staff ? <Documents email={staff.email} /> : null}</StaffGate>
    </>
  );
}
