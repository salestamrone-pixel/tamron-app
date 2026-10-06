import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '@/config/firebase';

// Append-only trail of who changed what. Failures never block the action itself.
export async function logAudit(action: string, detail: string) {
  const user = auth.currentUser;
  if (!user?.email) return;
  try {
    await addDoc(collection(db, 'audit'), {
      by: user.email.toLowerCase(),
      byName: user.displayName ?? '',
      action,
      detail,
      at: serverTimestamp(),
    });
  } catch {
    // Offline or not permitted.
  }
}
