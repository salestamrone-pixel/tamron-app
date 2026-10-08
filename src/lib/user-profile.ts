import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

import { db } from '@/config/firebase';

// Upserted on every successful sign-in so the admin dashboard can list everyone who
// has ever logged in — staff and customers alike — with when and from what device.
export async function recordUserProfile(firebaseUser: FirebaseUser, role: string) {
  try {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);
    const fields = {
      email: firebaseUser.email ?? '',
      name: firebaseUser.displayName ?? '',
      emailVerified: firebaseUser.emailVerified,
      role,
      platform: Platform.OS,
      deviceModel: Device.modelName ?? null,
      appBuild: Constants.expoConfig?.extra?.buildNumber ?? null,
      lastLoginAt: serverTimestamp(),
    };
    await setDoc(ref, snap.exists() ? fields : { ...fields, createdAt: serverTimestamp() }, { merge: true });
  } catch {
    // Bookkeeping only; must never block sign-in.
  }
}
