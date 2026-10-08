import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { auth, db } from '@/config/firebase';
import { registerForPushNotifications } from '@/lib/push';
import { recordUserProfile } from '@/lib/user-profile';
import { StaffMember, User } from '@/types';

interface AuthContextType {
  user: User | null;
  staff: StaffMember | null;
  isStaff: boolean;
  isAdmin: boolean;
  isManager: boolean;
  loading: boolean;
  staffStatus: string;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The company owner's account was created by the owner, so it is trusted without e-mail verification.
const OWNER_EMAIL = 'omarhussein271@gmail.com';

let staffStatus = '';

async function loadStaff(firebaseUser: FirebaseUser): Promise<StaffMember | null> {
  staffStatus = '';
  if (!firebaseUser.email) return null;
  try {
    // A session saved before the email was verified keeps a stale flag: refresh it and the token.
    if (!firebaseUser.emailVerified && firebaseUser.email.toLowerCase() !== OWNER_EMAIL) {
      await firebaseUser.reload();
      if (!firebaseUser.emailVerified) {
        staffStatus = 'البريد غير موثّق';
        return null;
      }
    }
    await firebaseUser.getIdToken(true);
    const snap = await getDoc(doc(db, 'staff', firebaseUser.email.toLowerCase()));
    if (!snap.exists()) {
      staffStatus = 'لا يوجد سجل لهذا البريد في قائمة الموظفين';
      return null;
    }
    const data = snap.data() as StaffMember;
    if (!data.active) staffStatus = 'حساب الموظف معطّل';
    return data.active ? data : null;
  } catch (e: any) {
    staffStatus = `تعذرت قراءة سجل الموظف: ${e?.code ?? e?.message ?? 'خطأ'}`;
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const apply = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setUser(null);
      setStaff(null);
      setLoading(false);
      return;
    }
    setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName ?? undefined,
      emailVerified: firebaseUser.emailVerified,
    });
    const staffMember = await loadStaff(firebaseUser);
    setStaff(staffMember);
    setStatus(staffStatus);
    setLoading(false);
    registerForPushNotifications(firebaseUser.uid);
    recordUserProfile(firebaseUser, staffMember?.role ?? 'customer');
  }, []);

  useEffect(() => onAuthStateChanged(auth, apply), [apply]);

  const refresh = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    // The verified flag only reaches security rules through a fresh token.
    await auth.currentUser.getIdToken(true);
    await apply(auth.currentUser);
  }, [apply]);

  return (
    <AuthContext.Provider
      value={{
        user,
        staff,
        isStaff: staff !== null,
        isAdmin: staff?.role === 'admin',
        isManager: staff?.role === 'admin' || staff?.role === 'hr',
        loading,
        staffStatus: status,
        logout: () => signOut(auth),
        refresh,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
