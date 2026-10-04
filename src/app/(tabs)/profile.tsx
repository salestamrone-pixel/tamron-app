import { useRouter } from 'expo-router';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';

import { Button, Card, Dialog, Empty, ErrorText, Field, Loading, Muted, P, Screen, Title } from '@/components/kit';
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
      <Empty title="حسابي" message="سجّل الدخول أو أنشئ حساباً جديداً.">
        <Button label="تسجيل الدخول" onPress={() => router.push('/auth/login')} />
        <Button label="إنشاء حساب" variant="outline" onPress={() => router.push('/auth/register')} />
      </Empty>
    );
  }

  const removeAccount = async () => {
    const current = auth.currentUser;
    if (!current || !current.email) return;
    setError('');
    setDeleting(true);
    try {
      await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, password));
      const mine = await getDocs(query(collection(db, 'quoteRequests'), where('userId', '==', current.uid)));
      await Promise.all(mine.docs.map((d) => deleteDoc(d.ref)));
      await deleteUser(current);
      setConfirmDelete(false);
    } catch {
      setError('تعذر حذف الحساب. تأكد من كلمة المرور وحاول مرة أخرى.');
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

      {isStaff ? <Button label="بوابة الموظفين" onPress={() => router.push('/staff')} /> : null}
      {isAdmin ? <Button label="لوحة الإدارة" onPress={() => router.push('/admin')} /> : null}

      <Button label="تسجيل الخروج" variant="outline" onPress={logout} />
      <Button label="حذف الحساب" variant="danger" onPress={() => setConfirmDelete(true)} />

      <Dialog
        visible={confirmDelete}
        title="حذف الحساب نهائياً"
        message="سيتم حذف حسابك وجميع طلباتك ولا يمكن التراجع. أدخل كلمة المرور للتأكيد."
        onClose={() => setConfirmDelete(false)}>
        <ErrorText>{error}</ErrorText>
        <Field label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry />
        <Button label="حذف نهائي" variant="danger" onPress={removeAccount} loading={deleting} disabled={!password} />
        <Button label="إلغاء" variant="outline" onPress={() => setConfirmDelete(false)} />
      </Dialog>
    </Screen>
  );
}
