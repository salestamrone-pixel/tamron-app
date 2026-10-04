import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { auth, db } from '@/config/firebase';
import { StaffMember, User } from '@/types';

interface AuthContextType {
  user: User | null;
  staff: StaffMember | null;
  isStaff: boolean;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadStaff(firebaseUser: FirebaseUser): Promise<StaffMember | null> {
  if (!firebaseUser.email || !firebaseUser.emailVerified) return null;
  try {
    const snap = await getDoc(doc(db, 'staff', firebaseUser.email.toLowerCase()));
    if (!snap.exists()) return null;
    const data = snap.data() as StaffMember;
    return data.active ? data : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);

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
    setStaff(await loadStaff(firebaseUser));
    setLoading(false);
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
        loading,
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
