# دليل التطوير - Tamron App

## 🏗️ البنية المعمارية

```
المستخدم
   ↓
[UI Components]
   ↓
[Context API] ← [Firebase]
   ↓
[Screens & Pages]
   ↓
[Stripe API] / [Backend]
```

## 📁 هيكل المشروع التفصيلي

### `/src/app` - صفحات التطبيق (Routing)

```
src/app/
├── (home)/           # Group الرئيسية
│   ├── _layout.tsx   # Navigation بين الصفحات
│   ├── index.tsx     # الصفحة الرئيسية
│   ├── services.tsx  # عرض الخدمات
│   ├── portfolio.tsx # معرض الأعمال
│   └── orders.tsx    # الطلبات
├── auth/             # Group المصادقة
│   ├── _layout.tsx
│   ├── login.tsx     # تسجيل دخول
│   └── register.tsx  # إنشاء حساب
├── cart.tsx          # سلة التسوق
├── profile.tsx       # الملف الشخصي
├── _layout.tsx       # الترتيب الرئيسي
└── index.tsx         # الصفحة الأولى
```

### `/context` - إدارة الحالة المشتركة

```
context/
├── AuthContext.tsx   # إدارة المستخدم والمصادقة
└── CartContext.tsx   # إدارة سلة التسوق
```

### `/types` - تعريفات TypeScript

```
types/
└── index.ts          # جميع الأنواع المستخدمة
```

### `/config` - الإعدادات

```
config/
└── firebase.ts       # تهيئة Firebase
```

## 🔄 تدفق البيانات

### تسجيل مستخدم جديد:

```
User Input (Register)
    ↓
Firebase Auth
    ↓
Create User Document
    ↓
AuthContext Updated
    ↓
Navigate to Home
```

### إضافة خدمة إلى السلة:

```
User clicks "Add to Cart"
    ↓
CartContext.addToCart()
    ↓
Update State
    ↓
Re-render Cart
```

### إتمام عملية شراء:

```
User clicks "Checkout"
    ↓
Stripe Payment
    ↓
Create Order in Firestore
    ↓
Clear Cart
    ↓
Confirmation
```

## 🛠️ كيفية إضافة ميزة جديدة

### مثال: إضافة خدمة جديدة

#### 1. أضف البيانات إلى Firestore

```javascript
// في Firebase Console
Collection: services
{
  id: "5",
  nameAr: "خدمة جديدة",
  name: "New Service",
  price: 1500,
  category: "other",
  description: "وصف الخدمة",
  image: "url_to_image",
  details: [...],
  detailsAr: [...]
}
```

#### 2. أنشئ مكون للخدمة الواحدة

```typescript
// src/components/ServiceCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Service } from '@/types';

export function ServiceCard({ service, onAddToCart }: {
  service: Service;
  onAddToCart: (service: Service, quantity: number) => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{service.nameAr}</Text>
      <Text style={styles.price}>{service.price} ر.س</Text>
      <TouchableOpacity onPress={() => onAddToCart(service, 1)}>
        <Text>أضف للسلة</Text>
      </TouchableOpacity>
    </View>
  );
}
```

#### 3. استخدم المكون في الشاشة

```typescript
// src/app/(home)/services.tsx
import { ServiceCard } from '@/components/ServiceCard';

export default function ServicesScreen() {
  const { addToCart } = useCart();
  
  return (
    <ScrollView>
      {services.map(service => (
        <ServiceCard
          key={service.id}
          service={service}
          onAddToCart={addToCart}
        />
      ))}
    </ScrollView>
  );
}
```

## 🎨 نمط التصميم (Design System)

### الألوان الأساسية

```typescript
// في src/constants/theme.ts
const COLORS = {
  primary: '#1e88e5',      // الأزرق الأساسي
  success: '#27ae60',      // الأخضر
  danger: '#d32f2f',       // الأحمر
  warning: '#ff9800',      // البرتقالي
  background: '#f5f5f5',   // خلفية رمادية
  text: '#333333',         // النص الأساسي
};
```

### الخطوط والأحجام

```typescript
const FONT_SIZES = {
  h1: 32,
  h2: 24,
  h3: 18,
  body: 14,
  small: 12,
};
```

## 🧪 الاختبار

### اختبار المكون

```typescript
import { render, screen } from '@testing-library/react-native';
import { ServiceCard } from '@/components/ServiceCard';

describe('ServiceCard', () => {
  it('displays service name', () => {
    const service = {
      id: '1',
      nameAr: 'خدمة',
      price: 500,
      // ... باقي البيانات
    };
    
    render(<ServiceCard service={service} onAddToCart={jest.fn()} />);
    expect(screen.getByText('خدمة')).toBeTruthy();
  });
});
```

## 🔒 الأمان

### قواعس Firestore الآمنة

```
rules_version = '3';
service cloud.firestore {
  match /databases/{database}/documents {
    // المستخدمون يمكنهم قراءة ملفاتهم فقط
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // الجميع يمكنهم قراءة الخدمات
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    // الطلبات خاصة بصاحبها
    match /orders/{orderId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

## 📝 معايير الكود

### تسمية الملفات

- Screens: `camelCase.tsx` - `servicesScreen.tsx`
- Components: `PascalCase.tsx` - `ServiceCard.tsx`
- Utils: `camelCase.ts` - `firebaseUtils.ts`

### تسمية المتغيرات

```typescript
// ✅ صحيح
const [isLoading, setIsLoading] = useState(false);
const handleAddToCart = (service) => {};

// ❌ خطأ
const [loading, setLoading] = useState(false);
const addToCart = (s) => {};
```

### التعليقات

```typescript
// ✅ تعليق مفيد
// تحديث الكمية في السلة
const updateQuantity = (serviceId, qty) => {
  // ...
};

// ❌ تعليق غير مفيد
// حلقة على السلة
cart.forEach(item => {});
```

## 🚀 الأداء

### تحسينات مهمة

```typescript
// استخدم useMemo للقيم المحسوبة
const totalPrice = useMemo(() => {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}, [cart]);

// استخدم useCallback للدوال
const handleAddToCart = useCallback((service) => {
  cartContext.addToCart(service);
}, [cartContext]);

// استخدم React.memo للمكونات الثقيلة
export const ServiceCard = React.memo(({ service }) => {
  return <View>...</View>;
});
```

## 🐛 التصحيح (Debugging)

### تفعيل تسجيل Firebase

```typescript
// في config/firebase.ts
import { getAuth, connectAuthEmulator } from 'firebase/auth';

if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

### تسجيل الأخطاء

```typescript
import * as Sentry from "sentry-expo";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});

try {
  // الكود
} catch (error) {
  Sentry.captureException(error);
}
```

## 📦 نشر التحديثات

### خطوات النشر

1. **تطوير محلي**
   ```bash
   npm start
   ```

2. **بناء APK/IPA**
   ```bash
   eas build --platform all
   ```

3. **النشر على المتاجر**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

4. **إصدار إصدار جديد**
   - زيادة version في app.json
   - نسخ التغييرات في CHANGELOG

## 📚 الموارد المفيدة

- [Expo Documentation](https://docs.expo.dev)
- [React Native API](https://reactnative.dev/docs/components-and-apis)
- [Firebase Guides](https://firebase.google.com/docs/guides)
- [Stripe Integration](https://stripe.com/docs/mobile/react-native)

---

**تذكر:** اقرأ هذا الدليل بعناية قبل البدء بأي تطوير جديد! 📖
