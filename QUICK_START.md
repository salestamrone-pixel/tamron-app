# دليل البدء السريع - Tamron App

## 🚀 البدء في 5 دقائق

### 1. افتح Terminal في مجلد المشروع

```bash
cd C:\Users\omarh\OneDrive\Desktop\tamron-app
```

### 2. انتظر تثبيت المكتبات (جاري)

المكتبات يتم تثبيتها بشكل آلي. عند انتهاء العملية ستكون جاهزة.

### 3. أنشئ ملف .env.local

```bash
# Windows
copy .env.example .env.local

# أو يدويا: اسحب .env.example وغير اسمه إلى .env.local
```

### 4. أضف بيانات Firebase

افتح `.env.local` وأضف:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
```

**كيفية الحصول على هذه البيانات:**
1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اختر مشروعك أو اضغط "إنشاء مشروع"
3. اذهب للإعدادات (⚙️) → Project Settings
4. اختر تبويب "Service Accounts"
5. اختر "Web" وانسخ البيانات

### 5. شغّل التطبيق

```bash
npm start
```

ثم اختر:
- **i** - iOS
- **a** - Android  
- **w** - Web

### 6. اختبر التطبيق

جرّب:
- ✅ تسجيل حساب جديد
- ✅ تسجيل دخول
- ✅ استعراض الخدمات
- ✅ إضافة إلى السلة
- ✅ عرض الملف الشخصي

## 📱 الحسابات الاختبارية

استخدم أي بريد إلكتروني وكلمة مرور لإنشاء حساب اختبار.

## 🔍 حل المشاكل الشائعة

### المشكلة: "Firebase is not initialized"
**الحل:** تأكد من .env.local يحتوي على البيانات الصحيحة

### المشكلة: "Cannot find module"
**الحل:** أعد تشغيل Terminal وحاول:
```bash
npm install
```

### المشكلة: Port 8081 already in use
**الحل:** 
```bash
# اقتل العملية القديمة
lsof -i :8081 | grep LISTEN | awk '{print $2}' | xargs kill -9

# أو شغّل على port مختلف
npm start -- --port 3000
```

## 📚 الملفات المهمة

```
tamron-app/
├── src/app/              # جميع الشاشات
├── config/firebase.ts    # إعدادات Firebase
├── context/             # إدارة الحالة
├── types/               # TypeScript types
├── .env.local          # متغيرات البيئة (غير موجود - أنشئه)
└── app.json            # إعدادات Expo
```

## 🎨 تخصيص الألوان والتصميم

عدّل الملفات التالية:
- `src/constants/theme.ts` - الألوان
- `src/global.css` - الأنماط العامة
- `app.json` - معلومات التطبيق

## 🌐 الترجمة والنصوص

جميع النصوص باللغة العربية. لتغيير النصوص:
- ابحث عن النص المطلوب في الملفات
- اتبع نفس البنية في الملفات الأخرى

## 💡 نصائح مفيدة

1. **Hot Reload**: عند حفظ الملف، التطبيق يتحدث تلقائياً
2. **Error Boundary**: جميع الأخطاء تظهر في الـ Terminal
3. **Firebase Emulator**: يمكنك استخدام محاكي Firebase محلي
4. **Stripe Test Mode**: استخدم أرقام بطاقات التجربة من Stripe

## 📞 التواصل والدعم

إذا واجهت مشاكل:
1. اقرأ رسائل الخطأ بعناية
2. تحقق من الـ Terminal output
3. أعد تشغيل التطبيق
4. احذف node_modules وأعد التثبيت

## ✅ Checklist المتطلبات

- [ ] تثبيت Node.js (من [nodejs.org](https://nodejs.org))
- [ ] تثبيت npm أو yarn
- [ ] حساب Firebase مجاني
- [ ] ملف .env.local مع البيانات الصحيحة
- [ ] تشغيل `npm start` بنجاح

---

**الآن أنت جاهز لبدء التطوير! 🎉**

للمزيد من المعلومات:
- 📖 [Expo Documentation](https://docs.expo.dev)
- 🔥 [Firebase Documentation](https://firebase.google.com/docs)
- ⚛️ [React Native Guide](https://reactnative.dev)
