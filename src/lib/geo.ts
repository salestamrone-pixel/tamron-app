import * as Location from 'expo-location';

import { GeoPoint, WorkSite } from '@/types';

export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export async function getCurrentPoint(): Promise<GeoPoint> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('يجب السماح للتطبيق بالوصول إلى الموقع.');
  }
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
}

export function nearestSite(point: GeoPoint, sites: WorkSite[]) {
  let best: { site: WorkSite; distance: number } | null = null;
  for (const site of sites) {
    const distance = distanceMeters(point, site);
    if (!best || distance < best.distance) best = { site, distance };
  }
  return best;
}

export function todayKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function mapsUrl(p: { lat: number; lng: number }) {
  return `https://www.google.com/maps?q=${p.lat},${p.lng}`;
}
