import * as firebaseAuth from 'firebase/auth';
import { Platform } from 'react-native';

import { auth } from '@/config/firebase';

// Popup sign-in only exists in the browser build; the phone build needs the native Google SDK.
export const googleSignInAvailable = Platform.OS === 'web';

export async function signInWithGoogle() {
  const provider = new firebaseAuth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await firebaseAuth.signInWithPopup(auth, provider);
}
