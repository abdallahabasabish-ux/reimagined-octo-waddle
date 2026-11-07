# Cloudflare Worker — الحل الجذري لمشكلة CORS

## لماذا تحتاج هذا الـ Worker؟

وكلاء CORS العموميون (`corsproxy.io`, `allorigins.win`, `codetabs.com`) **جميعهم معطّلون أو غير موثوقين** في 2026:
- `corsproxy.io` أصبح يتطلب مفتاح API مدفوع (401)
- `allorigins.win` يعمل بشكل متقطع جداً (1 من 5 مرات) ويعطي 500/522
- `codetabs.com` يفشل مع مواقع Cloudflare (522)

الحل الوحيد المضمون: **Cloudflare Worker مجاني** تتحكم به أنت.

## خطوات النشر (5 دقائق)

### 1. أنشئ حساب Cloudflare
- اذهب إلى https://dash.cloudflare.com
- سجّل حساب مجاني (لا يحتاج بطاقة ائتمان)

### 2. أنشئ Worker
- من القائمة الجانبية: **Workers & Pages**
- اضغط **Create application** → **Create Worker**
- الاسم: `blogpush-cors` (أي اسم)
- اضغط **Deploy**

### 3. أضف الكود
- اضغط **Edit code**
- احذف الكود الافتراضي في الملف الأيمن (`worker.js`)
- افتح ملف `worker/blogpush-worker.js` من هذا المشروع
- انسخ كامل قسم **WORKER CODE** (بين التعليقات)
- الصقه في محرر Cloudflare
- اضغط **Save and deploy**

### 4. انسخ الرابط
- بعد النشر، سترى رابطاً مثل:
  ```
  https://blogpush-cors.username.workers.dev
  ```
- انسخه

### 5. حدّث `js/api.js`
- افتح `js/api.js` في محررك
- عدّل السطر:
  ```javascript
  const BLOGPUSH_WORKER_URL = ''; // ضع رابطك هنا
  ```
- ليصبح:
  ```javascript
  const BLOGPUSH_WORKER_URL = 'https://blogpush-cors.username.workers.dev';
  ```

### 6. ارفع التحديث لـ GitHub
- ارفع `js/api.js` المُحدّث لمستودع GitHub Pages
- امسح كاش المتصفح (Ctrl+Shift+R)

## التحقق من العمل

بعد النشر، افتح رابط الـ Worker مباشرة في المتصفح:
```
https://blogpush-cors.username.workers.dev?url=https://freelancearab.com
```

يجب أن ترى HTML صفحة freelancearab.com. إن رأيته، الـ Worker يعمل.

## حدود الاستخدام المجاني

- **100,000 طلب/يوم** (يكفي لآلاف المستخدمين النشطين)
- **10 مليون طلب/شهر**
- لا حاجة لترقية للحساب المدفوع

## مشاكل شائعة

| المشكلة | الحل |
|---|---|
| `Worker exceeded CPU limit` | الكود بسيط، لن يحدث. إن حدث، ارفع للاشتراك المدفوع ($5/شهر) |
| `Script not found` | تأكد أنك نشرت الـ Worker (Deploy) وليس فقط حفظت |
| `corsproxy error` في الـ Worker | تأكد أنك نسخت كامل قسم WORKER CODE |
| المتصفح لا يرى التحديث | امسح الكاش: Ctrl+Shift+R أو افتح في وضع التخفي |

## لماذا Cloudflare؟

- مجاني بالكامل للحدود المذكورة
- سرعة عالمية (300+ موقع)
- يدعم ES modules وfetch API
- لا يفرض قيود على CORS
- متوافق مع جميع مواقع Cloudflare تلقائياً
