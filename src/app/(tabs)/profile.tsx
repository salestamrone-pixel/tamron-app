import { useRouter } from 'expo-router';
import { deleteUser, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup } from 'firebase/auth';
import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';

import { Button, Card, Dialog, Empty, ErrorText, Field, ListItem, Loading, Muted, P, palette, Screen, Title } from '@/components/kit';
import { auth, db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user, staff, isStaff, isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <Loading />;

  if (!user) {
    return (
      <Empty icon="account-circle-outline" title="حسابي" message="سجّل الدخول أو أنشئ حساباً جديداً.">
        <Button label="تسجيل الدخول" onPress={() => router.push('/auth/login')} />
        <Button label="إنشاء حساب" variant="outline" onPress={() => router.push('/auth/register')} />
      </Empty>
    );
  }

  const usesPassword = auth.currentUser?.providerData.some((p) => p.providerId === 'password') ?? true;

  const removeAccount = async () => {
    const current = auth.currentUser;
    if (!current || !current.email) return;
    setError('');
    setDeleting(true);
    try {
      if (usesPassword) {
        await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, password));
      } else {
        await reauthenticateWithPopup(current, new GoogleAuthProvider());
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
      </Card>

      {isStaff ? (
        <ListItem icon="map-marker-check-outline" title="بوابة الموظفين" subtitle="الحضور والانصراف" onPress={() => router.push('/staff')} />
      ) : null}
      {isAdmin ? (
        <ListItem icon="shield-crown-outline" title="لوحة الإدارة" subtitle="إدارة الطلبات والموظفين" onPress={() => router.push('/admin')} />
      ) : null}

      <Button label="تسجيل الخروج" icon="logout" variant="outline" onPress={logout} />
      <Button label="حذف الحساب" variant="danger" onPress={() => setConfirmDelete(true)} />

      <Dialog
        visible={confirmDelete}
        icon="alert-outline"
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
