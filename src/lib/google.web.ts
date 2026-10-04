import { GoogleAuthProvider, reauthenticateWithPopup, signInWithPopup, User } from 'firebase/auth';

import { auth } from '@/config/firebase';

export const googleSignInAvailable = true;

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithPopup(auth, provider);
}

export async function reauthWithGoogle(user: User) {
  await reauthenticateWithPopup(user, new GoogleAuthProvider());
}
