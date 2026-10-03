# تطبيق تامرون - Tamron App

تطبيق موبايل احترافي لشركة تامرون العربية المحدودة لخدمات التصميم والطباعة والليزر والـ CNC.

## المميزات الرئيسية

- 🏠 الصفحة الرئيسية مع عرض سريع للخدمات
- 🛍️ متصفح شامل للخدمات المختلفة
- 🏪 سلة تسوق متقدمة
- 💳 نظام دفع آمن (Stripe)
- 📦 تتبع الطلبات في الوقت الفعلي
- 👤 حسابات مستخدم آمنة (Firebase Auth)
- 🌐 دعم اللغة العربية الكامل
- 📱 واجهة استخدام سهلة وجميلة
- 🔐 تشفير وأمان عالي

## المتطلبات

- Node.js 16 أو أحدث
- npm أو yarn
- حساب Expo
- حساب Firebase

## التثبيت

### 1. استنساخ المشروع

```bash
cd tamron-app
```

### 2. تثبيت المكتبات

```bash
npm install
```

### 3. إعداد متغيرات البيئة

انسخ ملف `.env.example` إلى `.env.local` وأضف بيانات Firebase الخاصة بك:

```bash
cp .env.example .env.local
```

ثم عدّل `.env.local` بالقيم التالية:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### 4. تشغيل التطبيق في بيئة التطوير

```bash
npm start
```

ثم اختر منصة التشغيل:

- `i` - تشغيل على iOS (يتطلب macOS)
- `a` - تشغيل على Android
- `w` - تشغيل على الويب

## البناء والنشر

### بناء تطبيق التطوير

```bash
eas build --platform all --profile development
```

### بناء تطبيق الإنتاج

```bash
eas build --platform all --profile production
```

### نشر على متجري التطبيقات

```bash
eas submit --platform ios --latest
eas submit --platform android --latest
```

## هيكل المشروع

```
tamron-app/
├── src/
│   ├── app/
│   │   ├── (home)/        # صفحات الرئيسية والخدمات
│   │   ├── auth/          # صفحات التسجيل والدخول
│   │   ├── cart.tsx       # صفحة السلة
│   │   ├── profile.tsx    # صفحة الملف الشخصي
│   │   └── _layout.tsx    # الترتيب الرئيسي
│   ├── components/        # المكونات القابلة لإعادة الاستخدام
│   ├── context/           # Context API للحالة
│   ├── config/            # إعدادات Firebase وغيرها
│   ├── types/             # TypeScript Types
│   └── constants/         # الثوابت والألوان
├── config/                # ملفات الإعدادات
├── assets/                # الصور والأيقونات
├── app.json              # إعدادات Expo
├── eas.json              # إعدادات EAS Build
└── package.json          # المكتبات المثبتة
```

## الخدمات المدمجة

### Firebase
- Firebase Authentication (المصادقة)
- Cloud Firestore (قاعدة البيانات)
- Cloud Storage (تخزين الملفات)

### Stripe
- نظام الدفع الآمن
- إدارة الفواتير

### Expo
- تطوير وبناء التطبيق
- نشر على المتاجر

## دليل التطوير

### إضافة خدمة جديدة

1. قم بإضافة بيانات الخدمة إلى Firestore
2. قم بتحديث شاشة الخدمات لعرض الخدمة الجديدة

### تخصيص الألوان والأنماط

جميع الألوان محفوظة في ملف `colors` في constants. عدّل هذه الملفات لتغيير مظهر التطبيق.

### إضافة ميزات جديدة

1. أنشئ مكون جديد في `components/`
2. أضف context جديد في `context/` إذا كنت تحتاج لحالة مشتركة
3. أنشئ شاشة جديدة في `app/`

## التحديثات والصيانة

- تحديث المكتبات بانتظام: `npm update`
- اختبار التطبيق على أجهزة مختلفة
- مراقبة السجلات والأخطاء من خلال Firebase Console

## المساعدة والدعم

للمساعدة والدعم الفني، يرجى التواصل مع:
- البريد الإلكتروني: support@tamron.com
- الهاتف: +966 XX XXX XXXX

## الترخيص

© 2026 شركة تامرون العربية المحدودة. جميع الحقوق محفوظة.

## الملاحظات المهمة

- تأكد من توفر بيانات Firebase الصحيحة قبل التشغيل
- اختبر التطبيق على أجهزة مختلفة قبل النشر
- تحقق من جميع الصلاحيات المطلوبة في `app.json`
- استخدم رموز Stripe التجريبية أثناء التطوير
