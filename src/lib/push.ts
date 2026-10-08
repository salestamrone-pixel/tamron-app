import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { router } from 'expo-router';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { db } from '@/config/firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PROJECT_ID = Constants.expoConfig?.extra?.eas?.projectId;

// Called once a customer is signed in, so a Cloud Function can later reach their
// phone when a quote request they placed gets a status update or a price reply.
export async function registerForPushNotifications(uid: string) {
  try {
    if (!Device.isDevice) return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'تامرون',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#CCA741',
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return;

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
    await setDoc(doc(db, 'pushTokens', uid), { token, updatedAt: serverTimestamp() }, { merge: true });
  } catch {
    // Push is a nice-to-have; a failure here must never block sign-in.
  }
}

function openFromNotification(data: Record<string, unknown> | undefined) {
  if (data?.quoteId) router.push('/orders');
}

// Routes a tap on the notification (quote status/reply) to "طلباتي" — registered once
// at app start, plus a one-time check for the tap that cold-launched the app.
export function registerNotificationResponseHandler() {
  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) openFromNotification(response.notification.request.content.data);
  });
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    openFromNotification(response.notification.request.content.data);
  });
  return () => sub.remove();
}
