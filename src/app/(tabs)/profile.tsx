import { useRouter } from 'expo-router';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { Button, Card, Dialog, Empty, ErrorText, Field, ListItem, Loading, Muted, P, palette, Screen, Title } from '@/components/kit';
import { auth, db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { reauthWithGoogle } from '@/lib/google';

// TODO: swap for a page under www.tamrone.sa once the company hosts one there.
const PRIVACY_POLICY_URL = 'https://claude.ai/artifact/GQotoXtAbHDag2eb32GciL';

export default function ProfileScreen() {
  const { user, staff, isStaff, isAdmin, loading, logout, staffStatus, refresh } = useAuth();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => setPhone(snap.data()?.phone ?? ''))
      .catch(() => {});
  }, [user]);

  if (loading) return <Loading />;

  if (!user) {
    return (
      <Empty icon="person-circle-outline" title="حسابي" message="سجّل الدخول أو أنشئ حساباً جديداً.">
        <Button label="تسجيل الدخول" onPress={() => router.push('/auth/login')} />
        <Button label="إنشاء حساب" variant="outline" onPress={() => router.push('/auth/register')} />
      </Empty>
    );
  }

  const usesPassword = auth.currentUser?.providerData.some((p) => p.providerId === 'password') ?? true;

  const savePhone = async () => {
    setSavingPhone(true);
    setPhoneSaved(false);
    try {
      await setDoc(doc(db, 'users', user.uid), { phone: phone.trim() }, { merge: true });
      setPhoneSaved(true);
    } catch {
      // Not critical: the request form still lets the customer type it manually.
    } finally {
      setSavingPhone(false);
    }
  };

  const removeAccount = async () => {
    const current = auth.currentUser;
    if (!current || !current.email) return;
    setError('');
    setDeleting(true);
    try {
      if (usesPassword) {
        await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, password));
      } else {
        await reauthWithGoogle(current);
      }
      const mine = await getDocs(query(collection(db, 'quoteRequests'), where('userId', '==', current.uid)));
      await Promise.all(mine.docs.map((d) => deleteDoc(d.ref)));
      await deleteUser(current);
      setConfirmDelete(false);
    } catch {
      setError(usesPassword ? 'تعذر حذف الحساب. تأكد من كلمة المرور وحاول مرة أخرى.' : 'تعذر حذف الحساب. أكّد هويتك بحساب Google وحاول مرة أخرى.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Screen>
      <Card>
        <Title>{user.displayName || 'مستخدم'}</Title>
        <P>{user.email}</P>
        {staff ? <Muted>{staff.jobTitle || 'موظف'} · {isAdmin ? 'مدير النظام' : 'موظف'}</Muted> : null}
        {!staff && staffStatus ? <Muted>{staffStatus}</Muted> : null}
        {!staff && staffStatus ? <Button label="إعادة فحص حسابي" variant="outline" onPress={refresh} /> : null}
      </Card>

      <Card>
        <Title>رقم الجوال</Title>
        <Muted>يُستخدم لتعبئته تلقائياً في طلبات عرض السعر.</Muted>
        <Field label="رقم الجوال" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ textAlign: 'left' }} />
        <Button label={phoneSaved ? 'تم الحفظ' : 'حفظ'} icon="checkmark-outline" onPress={savePhone} loading={savingPhone} />
      </Card>

      {isStaff ? (
        <ListItem icon="location-outline" title="بوابة الموظفين" subtitle="الحضور والانصراف" onPress={() => router.push('/staff')} />
      ) : null}
      {isAdmin ? (
        <ListItem icon="shield-checkmark-outline" title="لوحة الإدارة" subtitle="إدارة الطلبات والموظفين" onPress={() => router.push('/admin')} />
      ) : null}
      <ListItem icon="document-lock-outline" title="سياسة الخصوصية" onPress={() => Linking.openURL(PRIVACY_POLICY_URL)} />

      <Button label="تسجيل الخروج" icon="log-out-outline" variant="outline" onPress={logout} />
      <Button label="حذف الحساب" variant="danger" onPress={() => setConfirmDelete(true)} />

      <Dialog
        visible={confirmDelete}
        icon="warning-outline"
        tone={palette.danger}
        title="حذف الحساب نهائياً"
        message={usesPassword ? 'سيتم حذف حسابك وجميع طلباتك ولا يمكن التراجع. أدخل كلمة المرور للتأكيد.' : 'سيتم حذف حسابك وجميع طلباتك ولا يمكن التراجع. سنطلب تأكيد هويتك بحساب Google.'}
        onClose={() => setConfirmDelete(false)}>
        <ErrorText>{error}</ErrorText>
        {usesPassword ? <Field label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry /> : null}
        <Button label="حذف نهائي" variant="danger" onPress={removeAccount} loading={deleting} disabled={usesPassword && !password} />
        <Button label="إلغاء" variant="outline" onPress={() => setConfirmDelete(false)} />
      </Dialog>
    </Screen>
  );
}
