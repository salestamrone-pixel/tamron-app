const { onDocumentUpdated, onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

// Expo recommends batches of 100 push tickets per request.
function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

async function sendExpoPush(messages) {
  for (const batch of chunk(messages, 100)) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(batch),
    });
  }
}

// Mirrors src/constants/services.ts STATUS_LABELS — kept in sync by hand since this
// function runs outside the Expo app bundle.
const STATUS_LABELS = {
  new: 'بانتظار رد الشركة',
  quoted: 'تم إرسال عرض السعر',
  in_progress: 'قيد التنفيذ',
  done: 'مكتمل',
  cancelled: 'ملغي',
};

// Notifies the customer on their phone the moment the company replies to or updates
// their quote request — the whole reason the app needed a Blaze-plan Cloud Function.
exports.notifyQuoteUpdate = onDocumentUpdated('quoteRequests/{id}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  const statusChanged = before.status !== after.status;
  const replyAdded = !before.reply && !!after.reply;
  if (!statusChanged && !replyAdded) return;

  const tokenSnap = await db.doc(`pushTokens/${after.userId}`).get();
  const token = tokenSnap.data()?.token;
  if (!token) return;

  const statusLabel = STATUS_LABELS[after.status] ?? after.status;
  const body = after.reply?.price
    ? `${after.serviceName}: وصل عرض سعر بقيمة ${after.reply.price}`
    : `${after.serviceName}: ${statusLabel}`;

  await sendExpoPush([{ to: token, title: 'تحديث على طلبك', body, sound: 'default', data: { quoteId: event.params.id } }]);
});

// The admin dashboard's "إشعار للعملاء" screen writes one of these; fan it out to
// every device that has ever registered a push token (staff and customers alike).
exports.sendBroadcast = onDocumentCreated('broadcasts/{id}', async (event) => {
  const { title, body } = event.data.data();
  const tokens = (await db.collection('pushTokens').get()).docs.map((d) => d.data().token).filter(Boolean);
  if (tokens.length === 0) return;
  await sendExpoPush(tokens.map((to) => ({ to, title, body, sound: 'default' })));
});
