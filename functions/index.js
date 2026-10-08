const { onDocumentUpdated, onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

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

async function getAdminTokens() {
  const adminUids = (await db.collection('users').where('role', '==', 'admin').get()).docs.map((d) => d.id);
  if (adminUids.length === 0) return [];
  const tokenDocs = await Promise.all(adminUids.map((uid) => db.doc(`pushTokens/${uid}`).get()));
  return tokenDocs.map((d) => d.data()?.token).filter(Boolean);
}

// staff/hrRequests/tasks key people by e-mail; pushTokens keys by auth uid. The `users`
// collection (written on every login) is the bridge between the two.
async function getTokenForEmail(email) {
  const userSnap = await db.collection('users').where('email', '==', email).limit(1).get();
  if (userSnap.empty) return null;
  const tokenSnap = await db.doc(`pushTokens/${userSnap.docs[0].id}`).get();
  return tokenSnap.data()?.token ?? null;
}

// YYYY-MM-DD in the company's own timezone, matching todayKey() in src/lib/geo.ts
// (which uses the device's local date — Saudi time for on-site staff).
function riyadhDateKey(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
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

// Once a day, nudges every admin who still has a quote request sitting unanswered
// for more than 24 hours — easy to miss among other work, easy to lose a customer over.
exports.remindStaleRequests = onSchedule('every 24 hours', async () => {
  const since = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
  const staleSnap = await db.collection('quoteRequests').where('status', '==', 'new').where('createdAt', '<=', since).get();
  if (staleSnap.empty) return;

  const tokens = await getAdminTokens();
  if (tokens.length === 0) return;

  const count = staleSnap.size;
  const body = count === 1 ? 'يوجد طلب عميل واحد بانتظار الرد منذ أكثر من يوم.' : `يوجد ${count} طلبات عملاء بانتظار الرد منذ أكثر من يوم.`;
  await sendExpoPush(tokens.map((to) => ({ to, title: 'طلبات بانتظار الرد', body, sound: 'default' })));
});

// A message on the quote's chat thread notifies whichever side didn't send it:
// the customer sending pings every admin, an admin reply pings just that customer.
exports.notifyQuoteMessage = onDocumentCreated('quoteRequests/{id}/messages/{messageId}', async (event) => {
  const message = event.data.data();
  const quoteSnap = await db.doc(`quoteRequests/${event.params.id}`).get();
  const quote = quoteSnap.data();
  if (!quote) return;

  const preview = message.text.length > 80 ? `${message.text.slice(0, 80)}…` : message.text;
  const data = { quoteId: event.params.id };

  if (message.senderRole === 'customer') {
    const tokens = await getAdminTokens();
    if (tokens.length === 0) return;
    await sendExpoPush(tokens.map((to) => ({ to, title: `رسالة من ${message.senderName || quote.userName}`, body: preview, sound: 'default', data })));
  } else {
    const tokenSnap = await db.doc(`pushTokens/${quote.userId}`).get();
    const token = tokenSnap.data()?.token;
    if (!token) return;
    await sendExpoPush([{ to: token, title: 'رسالة جديدة بخصوص طلبك', body: preview, sound: 'default', data }]);
  }
});

// Every 2 hours, flags any employee whose shift is still open (checked in, no checkout
// yet today) but whose last location update is over 2 hours old — the device likely
// lost the "allow all the time" permission, died, or the app got force-stopped.
exports.checkStaleTracking = onSchedule({ schedule: 'every 2 hours', timeZone: 'Asia/Riyadh' }, async () => {
  const date = riyadhDateKey();
  const openShifts = (await db.collection('attendance').where('date', '==', date).get()).docs
    .map((d) => d.data())
    .filter((a) => !a.checkOut);
  if (openShifts.length === 0) return;

  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  const stale = [];
  for (const shift of openShifts) {
    const locSnap = await db.doc(`locations/${shift.email}`).get();
    const updatedAtMs = locSnap.data()?.updatedAt?.toMillis?.() ?? 0;
    if (updatedAtMs < cutoff) stale.push(shift.name || shift.email);
  }
  if (stale.length === 0) return;

  const tokens = await getAdminTokens();
  if (tokens.length === 0) return;
  await sendExpoPush(
    tokens.map((to) => ({ to, title: 'تنبيه: تتبع موقع متوقف', body: `توقف تحديث الموقع منذ أكثر من ساعتين لـ: ${stale.join('، ')}`, sound: 'default' })),
  );
});

// Once a day near end-of-shift, lists anyone still checked in with no checkout, so the
// admin can follow up (a missed checkout left uncorrected would skew payroll hours).
exports.remindMissedCheckouts = onSchedule({ schedule: '0 22 * * *', timeZone: 'Asia/Riyadh' }, async () => {
  const date = riyadhDateKey();
  const open = (await db.collection('attendance').where('date', '==', date).get()).docs
    .map((d) => d.data())
    .filter((a) => !a.checkOut);
  if (open.length === 0) return;

  const tokens = await getAdminTokens();
  if (tokens.length === 0) return;
  const names = open.map((a) => a.name || a.email).join('، ');
  await sendExpoPush(tokens.map((to) => ({ to, title: 'لم يُسجَّل انصراف', body: `لم يسجّل الانصراف اليوم: ${names}`, sound: 'default' })));
});

// A leave/permission decision (hrRequests) notifies the employee who filed it.
exports.notifyHrDecision = onDocumentUpdated('hrRequests/{id}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();
  if (before.status === after.status || after.status === 'pending') return;

  const token = await getTokenForEmail(after.email);
  if (!token) return;
  const decisionLabel = after.status === 'approved' ? 'تمت الموافقة على طلبك' : 'تم رفض طلبك';
  const typeLabel = after.type === 'leave' ? 'إجازة' : 'إذن';
  await sendExpoPush([{ to: token, title: decisionLabel, body: `طلب ${typeLabel}: ${after.from} إلى ${after.to}`, sound: 'default' }]);
});

// A new task assignment notifies whoever it was assigned to.
exports.notifyTaskAssigned = onDocumentCreated('tasks/{id}', async (event) => {
  const task = event.data.data();
  const token = await getTokenForEmail(task.assigneeEmail);
  if (!token) return;
  await sendExpoPush([{ to: token, title: 'مهمة جديدة', body: task.title, sound: 'default' }]);
});
