import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, increment, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

import { db } from '@/config/firebase';

const SEEN_KEY = 'tamron:device-counted';

// Fires once per app process start, signed in or not, so the admin dashboard can
// show how many times the app was opened and roughly how many distinct devices did it.
export async function recordAppOpen() {
  if (Platform.OS === 'web') return;
  try {
    const seen = await AsyncStorage.getItem(SEEN_KEY);
    const fields: Record<string, ReturnType<typeof increment>> = { totalOpens: increment(1) };
    if (!seen) {
      fields.uniqueDevices = increment(1);
      await AsyncStorage.setItem(SEEN_KEY, '1');
    }
    await setDoc(doc(db, 'analytics', 'summary'), fields, { merge: true });
  } catch {
    // A visit counter must never block the app from opening.
  }
}
