import { collection, getDocs } from 'firebase/firestore';

import { db } from '@/config/firebase';
import { enableTracking, isTrackingOn } from '@/lib/tracking';
import { WorkSite } from '@/types';

let attemptedThisSession = false;

// Field workers aren't expected to find a toggle or read an in-app explanation, so this
// runs the instant a staff login resolves, with no screen or button in between — the
// only unavoidable step left is the one-time OS "Allow all the time" location prompt.
export async function autoEnableTracking(profile: { email: string; name: string }) {
  if (attemptedThisSession) return;
  attemptedThisSession = true;
  try {
    if (await isTrackingOn()) return;
    const sitesSnap = await getDocs(collection(db, 'sites'));
    const sites = sitesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkSite, 'id'>) }));
    await enableTracking(profile, sites);
  } catch {
    // Permission declined or not yet granted — the status card on /staff still offers
    // a manual retry button for this device.
  }
}
