import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '@/config/firebase';

// Lets a customer pick reference images (a logo, a site photo, a design file) from
// their gallery so the quote reflects what they actually want, not just a text description.
export async function pickImages(limit: number): Promise<string[]> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return [];
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
    quality: 0.6,
  });
  if (result.canceled) return [];
  return result.assets.map((a) => a.uri);
}

async function uploadToStorage(path: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

export function uploadAttachment(uid: string, uri: string): Promise<string> {
  return uploadToStorage(`quoteAttachments/${uid}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`, uri);
}

// Lets an admin upload a product photo straight from their device instead of pasting a URL.
export function uploadStoreImage(uid: string, uri: string): Promise<string> {
  return uploadToStorage(`storeImages/${uid}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`, uri);
}

// A finished quote request's photo, added straight to the public work gallery.
export function uploadPortfolioImage(uid: string, uri: string): Promise<string> {
  return uploadToStorage(`portfolioImages/${uid}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`, uri);
}
