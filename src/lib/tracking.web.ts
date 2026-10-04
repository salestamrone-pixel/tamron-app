import { WorkSite } from '@/types';

// Background location only exists in the phone app.
export const trackingSupported = false;

interface Profile {
  email: string;
  name: string;
}

export async function isTrackingOn() {
  return false;
}
export async function syncGeofences(_sites: WorkSite[]) {}
export async function enableTracking(_profile: Profile, _sites: WorkSite[]) {}
export async function disableTracking(_profile: Profile) {}
