import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, reauthenticateWithCredential, signInWithCredential, User } from 'firebase/auth';

import { auth } from '@/config/firebase';

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export const googleSignInAvailable = !!webClientId;

async function googleCredential() {
  GoogleSignin.configure({ webClientId });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  if (result.type !== 'success' || !result.data.idToken) {
    throw Object.assign(new Error('cancelled'), { code: 'auth/popup-closed-by-user' });
  }
  // Firebase keeps the session from here on; dropping Google's lets the account picker show next time.
  await GoogleSignin.signOut().catch(() => {});
  return GoogleAuthProvider.credential(result.data.idToken);
}

export async function signInWithGoogle() {
  await signInWithCredential(auth, await googleCredential());
}

export async function reauthWithGoogle(user: User) {
  await reauthenticateWithCredential(user, await googleCredential());
}
