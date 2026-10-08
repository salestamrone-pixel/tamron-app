const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

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

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      to: token,
      title: 'تحديث على طلبك',
      body,
      sound: 'default',
      data: { quoteId: event.params.id },
    }),
  });
});
