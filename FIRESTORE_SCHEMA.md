# نموذج قاعدة بيانات Firestore

هذا الملف يوضح بنية قاعدة البيانات في Firestore للتطبيق.

## Collections Overview

```
Firestore Database
├── users/              # بيانات المستخدمين
├── services/           # الخدمات المتاحة
├── orders/             # الطلبات
├── portfolios/         # الأعمال السابقة
└── payments/           # سجل الدفعات
```

## 1. Collection: users

**الغرض:** حفظ بيانات المستخدمين المسجلين

```
Document ID: {user.uid من Firebase Auth}

{
  uid: string                    // معرّف المستخدم الفريد
  email: string                  // البريد الإلكتروني
  displayName: string            // اسم المستخدم
  phoneNumber: string            // رقم الهاتف
  company: string (optional)     // اسم الشركة
  address: string (optional)     // العنوان
  profileImage: string (optional)// رابط الصورة
  role: "customer" | "admin"     // دور المستخدم
  createdAt: timestamp           // تاريخ الإنشاء
  updatedAt: timestamp           // آخر تحديث
  isActive: boolean              // هل الحساب مفعل
}
```

### مثال:
```json
{
  "uid": "user123abc",
  "email": "customer@email.com",
  "displayName": "محمد علي",
  "phoneNumber": "+966501234567",
  "company": "شركة الأمل",
  "address": "الرياض - منطقة المربع",
  "role": "customer",
  "createdAt": "2026-10-03T09:00:00Z",
  "updatedAt": "2026-10-03T09:00:00Z",
  "isActive": true
}
```

---

## 2. Collection: services

**الغرض:** حفظ الخدمات المتاحة للشراء

```
Document ID: auto-generated (يمكن استخدام رقم تسلسلي)

{
  id: string                           // معرّف الخدمة
  name: string                         // اسم الخدمة بالإنجليزية
  nameAr: string                       // اسم الخدمة بالعربية
  description: string                  // الوصف بالإنجليزية
  descriptionAr: string                // الوصف بالعربية
  category: "banners" | "signage" | 
            "laser" | "cnc" | "other"  // فئة الخدمة
  price: number                        // السعر الأساسي
  discountPrice: number (optional)     // السعر بعد الخصم
  image: string                        // رابط الصورة الأساسية
  images: string[]                     // روابط الصور الإضافية
  details: string[]                    // التفاصيل بالإنجليزية
  detailsAr: string[]                  // التفاصيل بالعربية
  specifications: object               // المواصفات الإضافية
  inStock: boolean                     // هل الخدمة متاحة
  rating: number (0-5)                 // التقييم المتوسط
  reviewCount: number                  // عدد التقييمات
  createdAt: timestamp                 // تاريخ الإضافة
  updatedAt: timestamp                 // آخر تحديث
  createdBy: string                    // معرّف الموظف صاحب الإضافة
}
```

### مثال:
```json
{
  "id": "service_001",
  "name": "Banner Design",
  "nameAr": "تصميم بنرات",
  "description": "Professional banner design and printing",
  "descriptionAr": "تصميم وطباعة بنرات احترافية",
  "category": "banners",
  "price": 500,
  "discountPrice": 450,
  "image": "https://storage.com/banner1.jpg",
  "images": ["https://storage.com/banner1.jpg", "..."],
  "details": ["High quality", "Custom sizes", "Fast delivery"],
  "detailsAr": ["جودة عالية", "أحجام مخصصة", "توصيل سريع"],
  "inStock": true,
  "rating": 4.8,
  "reviewCount": 42,
  "createdAt": "2026-09-01T10:00:00Z",
  "updatedAt": "2026-10-02T15:30:00Z",
  "createdBy": "admin_user_123"
}
```

---

## 3. Collection: orders

**الغرض:** حفظ الطلبات المقدمة من قبل المستخدمين

```
Document ID: auto-generated

{
  id: string                             // معرّف الطلب الفريد
  userId: string                         // معرّف المستخدم
  items: array[OrderItem]                // العناصر المطلوبة
    {
      serviceId: string
      serviceName: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }
  subtotal: number                       // الإجمالي قبل الضرائب
  tax: number                            // الضريبة
  discount: number                       // الخصم إن وجد
  total: number                          // الإجمالي النهائي
  status: "pending" | "confirmed" | 
          "in_progress" | "completed" | 
          "cancelled"                    // حالة الطلب
  paymentStatus: "unpaid" | "paid" | 
                 "refunded"              // حالة الدفع
  paymentMethod: "credit_card" | 
                 "debit_card" | "paypal"// طريقة الدفع
  shippingAddress: object                // عنوان التوصيل
  notes: string                          // ملاحظات إضافية
  estimatedDelivery: timestamp           // تاريخ التسليم المتوقع
  actualDelivery: timestamp (optional)   // تاريخ التسليم الفعلي
  createdAt: timestamp                   // تاريخ الطلب
  updatedAt: timestamp                   // آخر تحديث
  cancelledAt: timestamp (optional)      // تاريخ الإلغاء
  cancelReason: string (optional)        // سبب الإلغاء
}
```

### مثال:
```json
{
  "id": "order_2026_001",
  "userId": "user123abc",
  "items": [
    {
      "serviceId": "service_001",
      "serviceName": "تصميم بنرات",
      "quantity": 2,
      "unitPrice": 500,
      "totalPrice": 1000
    }
  ],
  "subtotal": 1000,
  "tax": 150,
  "discount": 0,
  "total": 1150,
  "status": "in_progress",
  "paymentStatus": "paid",
  "paymentMethod": "credit_card",
  "shippingAddress": {
    "street": "شارع الملك فهد",
    "city": "الرياض",
    "region": "منطقة الرياض",
    "postalCode": "12345",
    "country": "SA"
  },
  "notes": "يرجى الاهتمام بجودة الطباعة",
  "estimatedDelivery": "2026-10-10T00:00:00Z",
  "createdAt": "2026-10-03T10:00:00Z",
  "updatedAt": "2026-10-03T15:30:00Z"
}
```

---

## 4. Collection: portfolios

**الغرض:** عرض الأعمال السابقة الناجحة

```
Document ID: auto-generated

{
  id: string                        // معرّف العمل
  title: string                     // العنوان بالإنجليزية
  titleAr: string                   // العنوان بالعربية
  description: string               // الوصف بالإنجليزية
  descriptionAr: string             // الوصف بالعربية
  category: string                  // فئة العمل (مثل: branding, signage)
  client: string                    // اسم العميل
  images: string[]                  // روابط الصور
  mainImage: string                 // الصورة الأساسية
  tags: string[]                    // الكلمات المفتاحية
  technologies: string[]            // التقنيات المستخدمة
  completionDate: timestamp         // تاريخ الإنجاز
  featured: boolean                 // هل هو من الأعمال المختارة
  views: number                     // عدد المشاهدات
  likes: number                     // عدد الإعجابات
  createdAt: timestamp              // تاريخ الإضافة
  updatedAt: timestamp              // آخر تحديث
}
```

### مثال:
```json
{
  "id": "portfolio_001",
  "title": "Corporate Branding",
  "titleAr": "الهوية البصرية للشركات",
  "description": "Professional branding solutions for corporate clients",
  "descriptionAr": "حلول هوية بصرية احترافية للعملاء من المؤسسات",
  "category": "branding",
  "client": "شركة تقنيات المستقبل",
  "images": ["https://storage.com/work1_1.jpg", "..."],
  "mainImage": "https://storage.com/work1_main.jpg",
  "tags": ["branding", "design", "corporate"],
  "technologies": ["Laser Cutting", "Digital Design"],
  "completionDate": "2026-08-15T00:00:00Z",
  "featured": true,
  "views": 234,
  "likes": 45,
  "createdAt": "2026-08-16T10:00:00Z",
  "updatedAt": "2026-10-01T12:00:00Z"
}
```

---

## 5. Collection: payments

**الغرض:** سجل جميع المعاملات المالية

```
Document ID: auto-generated

{
  id: string                        // معرّف الدفعة
  orderId: string                   // معرّف الطلب المرتبط
  userId: string                    // معرّف المستخدم
  amount: number                    // المبلغ المدفوع
  currency: string                  // العملة (SAR, USD, etc)
  method: "stripe" | "paypal" |
          "bank_transfer"           // طريقة الدفع
  stripePaymentId: string (optional)// معرّف الدفعة من Stripe
  status: "pending" | "succeeded" |
          "failed" | "refunded"     // حالة الدفعة
  description: string               // وصف الدفعة
  receipt: object                   // إيصال الدفع
  metadata: object                  // بيانات إضافية
  createdAt: timestamp              // تاريخ الدفع
  processedAt: timestamp (optional) // تاريخ معالجة الدفع
  failureReason: string (optional)  // سبب الفشل إن وجد
}
```

---

## 📊 Sub-collections (اختياري)

### users/{userId}/orders
سجل الطلبات لكل مستخدم (لتسريع الاستعلامات)

### orders/{orderId}/timeline
سجل تحديثات الطلب بمرور الوقت

### services/{serviceId}/reviews
التقييمات والتعليقات على الخدمة

---

## 🔐 أمثلة قواعد الأمان

```firestore
rules_version = '3';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // المستخدمون يقرؤون ملفاتهم فقط
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // الجميع يقرؤون الخدمات
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    // الطلبات خاصة بصاحبها
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.userId 
                     || request.auth.token.admin == true;
      allow write: if request.auth.uid == resource.data.userId
                     || request.auth.token.admin == true;
    }
    
    // معرض الأعمال عام
    match /portfolios/{portfolioId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    // الدفعات يراها المستخدم والمدير فقط
    match /payments/{paymentId} {
      allow read: if request.auth.uid == resource.data.userId
                     || request.auth.token.admin == true;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

---

## 🔄 التكامل مع التطبيق

### مثال: جلب الخدمات

```typescript
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

async function getServices() {
  const servicesRef = collection(db, 'services');
  const snapshot = await getDocs(servicesRef);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

### مثال: إنشاء طلب جديد

```typescript
import { collection, addDoc } from 'firebase/firestore';

async function createOrder(userId, items, total) {
  const ordersRef = collection(db, 'orders');
  
  const docRef = await addDoc(ordersRef, {
    userId,
    items,
    total,
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return docRef.id;
}
```

---

**هذه البنية قابلة للتعديل والتطوير حسب احتياجات المشروع** 📝
