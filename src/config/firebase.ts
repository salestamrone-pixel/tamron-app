import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const app = initializeApp({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
});

function createAuth() {
  // Only firebase's react-native build exports this, and its typings omit it.
  const nativePersistence = (firebaseAuth as any).getReactNativePersistence;
  if (Platform.OS === 'web' || !nativePersistence) return firebaseAuth.getAuth(app);
  try {
    return firebaseAuth.initializeAuth(app, { persistence: nativePersistence(AsyncStorage) });
  } catch {
    // Fast refresh re-evaluates this module after auth was already initialized.
    return firebaseAuth.getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);
