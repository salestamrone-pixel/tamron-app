# دليل إعداد Firebase

هذا الدليل يساعدك على إعداد Firebase لتطبيق تامرون.

## الخطوة 1: إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. انقر على "Create Project" أو "إنشاء مشروع"
3. أدخل اسم المشروع: "Tamron App" أو اسم مشابه
4. اقبل شروط الخدمة
5. انقر "Continue" أو "متابعة"

## الخطوة 2: تفعيل Authentication

1. في لوحة التحكم، انقر على "Authentication"
2. انقر على تبويب "Sign-in method"
3. فعّل "Email/Password"

## الخطوة 3: إنشاء Firestore Database

1. انقر على "Cloud Firestore"
2. اختر "Create Database"
3. اختر "Start in test mode" (للتطوير)
4. اختر المنطقة الجغرافية الأقرب: `europe-west1` أو مقاربة
5. انقر "Enable"

## الخطوة 4: الحصول على بيانات المشروع

1. انقر على رمز الترس (Settings) أعلى اليسار
2. اختر "Project settings"
3. انقر على تبويب "Service accounts"
4. سيجد "Firebase SDK snippet"
5. اختر "Web" من القائمة المنسدلة
6. انسخ بيانات الإعدادات:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## الخطوة 5: إعداد متغيرات البيئة

1. افتح ملف `.env.local` في جذر المشروع
2. أضف القيم التالية:

```
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

## الخطوة 6: إنشاء Collections في Firestore

### 1. Collections للخدمات (services)

```
Collection: services
Documents:
  - id: "1"
    name: "تصميم بنرات"
    price: 500
    category: "banners"
    description: "تصميم وطباعة بنرات مخصصة"
    ... (أضف الحقول الأخرى)
```

### 2. Collections للطلبات (orders)

```
Collection: orders
Documents:
  - id: auto-generated
    userId: "user-id"
    serviceId: "service-id"
    quantity: 1
    totalPrice: 500
    status: "pending"
    createdAt: timestamp
    ... (أضف الحقول الأخرى)
```

### 3. Collections للمستخدمين (users)

```
Collection: users
Documents:
  - uid: "firebase-user-id"
    email: "user@example.com"
    displayName: "اسم المستخدم"
    phoneNumber: "+966501234567"
    company: "اسم الشركة"
    ... (معلومات إضافية)
```

## الخطوة 7: تعيين قواعد الأمان

في Firebase Console:

1. انقر على "Cloud Firestore"
2. انقر على تبويب "Rules"
3. أضف القواعس التالية للتطوير (لاختبار فقط):

```
rules_version = '3';
service cloud.firestore {
  match /databases/{database}/documents {
    // عام الجميع بالقراءة والكتابة - للتطوير فقط
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**تحذير**: قواعس التطوير هذه غير آمنة للإنتاج! استخدمها للاختبار فقط.

## الخطوة 8: إعداد Cloud Storage

1. انقر على "Cloud Storage"
2. انقر على "Create bucket"
3. اسم الـ bucket: `tamron-app-storage` أو مشابه
4. اختر منطقة قريبة من المستخدمين
5. انقر "Create"

## الخطوة 9: اختبار الإعدادات

في Terminal:

```bash
npm start
```

اختبر التسجيل والدخول للتأكد من أن Firebase يعمل بشكل صحيح.

## الخطوة 10: إعداد Stripe (الدفع)

1. اذهب إلى [Stripe Dashboard](https://dashboard.stripe.com)
2. احصل على "Publishable Key"
3. أضفها إلى `.env.local`:

```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## المشاكل الشائعة وحلولها

### المشكلة: خطأ "Firebase initialization failed"

**الحل**: تأكد من صحة بيانات Firebase في `.env.local`

### المشكلة: لا يمكن إنشاء حسابات جديدة

**الحل**: تأكد من تفعيل "Email/Password" في Authentication

### المشكلة: خطأ في Firestore permissions

**الحل**: تحقق من قواعس الأمان في Firestore Rules

## الموارد الإضافية

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Firebase Guide](https://docs.expo.dev/build-reference/eas-json/)
- [Stripe Documentation](https://stripe.com/docs)

## التواصل

إذا واجهت مشاكل، تفضل بالتواصل مع فريق الدعم.
