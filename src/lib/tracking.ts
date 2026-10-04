import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { addDoc, collection, deleteField, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { auth, db } from '@/config/firebase';
import { todayKey } from '@/lib/geo';
import { WorkSite } from '@/types';

const TRACK_TASK = 'tamrone-location-updates';
const GEOFENCE_TASK = 'tamrone-site-geofence';
const PROFILE_KEY = 'tracking:profile';
const SITES_KEY = 'tracking:sites';

export const trackingSupported = true;

interface Profile {
  email: string;
  name: string;
}

// Background tasks run without any screen mounted, so identity comes from the persisted session.
async function currentProfile(): Promise<Profile | null> {
  await auth.authStateReady();
  const email = auth.currentUser?.email?.toLowerCase();
  if (!email) return null;
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  const profile = raw ? (JSON.parse(raw) as Profile) : null;
  return profile && profile.email === email ? profile : null;
}

TaskManager.defineTask<{ locations: Location.LocationObject[] }>(TRACK_TASK, async ({ data, error }) => {
  if (error || !data?.locations?.length) return;
  try {
    const profile = await currentProfile();
    if (!profile) return;
    const last = data.locations[data.locations.length - 1];
    const point = {
      lat: last.coords.latitude,
      lng: last.coords.longitude,
      accuracy: last.coords.accuracy ?? null,
      mocked: last.mocked ?? false,
    };
    await setDoc(doc(db, 'locations', profile.email), { ...profile, ...point, updatedAt: serverTimestamp() });
    await addDoc(collection(db, 'locations', profile.email, 'points'), {
      ...point,
      date: todayKey(),
      at: serverTimestamp(),
    });
  } catch {
    // Offline or signed out: the next update will try again.
  }
});

TaskManager.defineTask<{ eventType: Location.GeofencingEventType; region: Location.LocationRegion }>(
  GEOFENCE_TASK,
  async ({ data, error }) => {
    if (error || !data?.region) return;
    try {
      const profile = await currentProfile();
      if (!profile) return;
      const siteId = data.region.identifier ?? '';
      const names = JSON.parse((await AsyncStorage.getItem(SITES_KEY)) ?? '{}') as Record<string, string>;
      const date = todayKey();
      const ref = doc(db, 'attendance', `${profile.email}_${date}`);
      const loc = { lat: data.region.latitude, lng: data.region.longitude, accuracy: null };

      if (data.eventType === Location.GeofencingEventType.Enter) {
        try {
          // Came back after stepping out: reopen today's record instead of creating a second one.
          await updateDoc(ref, { checkOut: deleteField(), checkOutLoc: deleteField() });
        } catch {
          await setDoc(ref, {
            email: profile.email,
            name: profile.name,
            date,
            siteId,
            siteName: names[siteId] ?? '',
            checkIn: serverTimestamp(),
            checkInLoc: loc,
            auto: true,
          });
        }
      } else if (data.eventType === Location.GeofencingEventType.Exit) {
        await updateDoc(ref, { checkOut: serverTimestamp(), checkOutLoc: loc });
      }
    } catch {
      // No record to close, or offline.
    }
  },
);

export async function isTrackingOn() {
  return Location.hasStartedLocationUpdatesAsync(TRACK_TASK);
}

export async function syncGeofences(sites: WorkSite[]) {
  await AsyncStorage.setItem(SITES_KEY, JSON.stringify(Object.fromEntries(sites.map((s) => [s.id, s.name]))));
  if (sites.length === 0) {
    if (await Location.hasStartedGeofencingAsync(GEOFENCE_TASK)) await Location.stopGeofencingAsync(GEOFENCE_TASK);
    return;
  }
  await Location.startGeofencingAsync(
    GEOFENCE_TASK,
    sites.map((s) => ({
      identifier: s.id,
      latitude: s.lat,
      longitude: s.lng,
      radius: Math.max(s.radius, 100),
      notifyOnEnter: true,
      notifyOnExit: true,
    })),
  );
}

export async function enableTracking(profile: Profile, sites: WorkSite[]) {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') throw new Error('يجب السماح للتطبيق بالوصول إلى الموقع.');
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== 'granted') {
    throw new Error('اختر «السماح طوال الوقت» من إعدادات الموقع للتطبيق حتى يعمل الحضور التلقائي.');
  }
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  await Location.startLocationUpdatesAsync(TRACK_TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 5 * 60 * 1000,
    distanceInterval: 100,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'تامرون',
      notificationBody: 'يتم تسجيل موقعك للحضور ومتابعة الإدارة.',
      notificationColor: '#CCA741',
    },
  });
  await syncGeofences(sites);
  await setDoc(doc(db, 'consents', profile.email), { ...profile, active: true, version: 1, at: serverTimestamp() });
}

export async function disableTracking(profile: Profile) {
  if (await Location.hasStartedLocationUpdatesAsync(TRACK_TASK)) await Location.stopLocationUpdatesAsync(TRACK_TASK);
  if (await Location.hasStartedGeofencingAsync(GEOFENCE_TASK)) await Location.stopGeofencingAsync(GEOFENCE_TASK);
  await setDoc(doc(db, 'consents', profile.email), { ...profile, active: false, version: 1, at: serverTimestamp() });
}
