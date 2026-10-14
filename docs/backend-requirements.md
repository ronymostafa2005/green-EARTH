# متطلبات الباك اند — موقع Demeter Green Earth + لوحة التحكم

Base URL: `https://clinicaipoweredsystem.runasp.net/api/v1/`

كل الـ responses لازم تفضل بنفس الشكل الحالي:

```json
{ "statusCode": 200, "succeeded": true, "message": "", "errors": [], "data": ... }
```

والـ lists بنفس شكل `GetPaginatedList` الحالي: `data, currentPage, totalPages, totalCount, pageSize`.

---

## 1) الصلاحيات وتسجيل الدخول

| # | المطلوب | التفاصيل |
|---|---|---|
| 1 | **الـ GET العامة بدون توكن** `[AllowAnonymous]` | `Product/GetPaginatedList`, `Product/GetById/{id}`, `ProductCategory/GetPaginatedList`, `Certification/GetPaginatedList`, `Exhibition/GetPaginatedList`, `ContactUs/Create`، وكل endpoints "محتوى الموقع" الجديدة (قسم 4). |
| 2 | **باقي العمليات بتوكن أدمن فقط** | كل `Create / Update / HardDelete` و `ContactUs/GetPaginatedList`. |
| 3 | **Rate limit على SignIn** | حاليًا بيقفل بسرعة ("عدد كبير جدًا من الطلبات") — يُفضّل مثلًا 10 محاولات / 15 دقيقة. |
| 4 | **حساب الأدمن النهائي للعميل** | حساب باسم الشركة (مش حساب تجربة) بصلاحيات كاملة على كل الـ entities. |
| 5 | **Refresh Token** (اختياري) | `Authentication/RefreshToken` — لو مش موجود، الأدمن هيعمل login تاني لما التوكن يخلص. |

---

## 2) الـ Endpoints الموجودة اللي الداشبورد بيستخدمها (محتاجين تأكيد إنها شغالة بتوكن الأدمن)

القاعدة لكل entity:
`POST {Entity}/GetPaginatedList` — `GET {Entity}/GetById/{id}` — `POST {Entity}/Create` — `PUT {Entity}/Update` — `DELETE {Entity}/HardDelete/{id}`

| الشاشة | Entity | نوع الـ Body في Create/Update | ملاحظات |
|---|---|---|---|
| الأقسام | `ProductCategory` | JSON: `name, nameLocalization, description, descriptionLocalization` | |
| المنتجات | `Product` | Create: **multipart** (`Name, NameLocalization, Description, DescriptionLocalization, ProductCategoryId, Images[], VarietyNames[], TypeNames[], PackingTypeNames[], VitaminIds[], MineralIds[], HarvestMonthCodes[]`) — Update: JSON (البيانات الأساسية بس) | |
| صور المنتج (Gallery) | `ProductImage` | multipart: `ProductId, ImagePathFile` | الحذف بـ `HardDelete/{imageId}` — لازم `id` الصورة يرجع جوه `product.images[]`. |
| الأصناف | `ProductVariety` | JSON: `name, nameLocalization, productId` | |
| الأنواع (Product Types) | `Type` + ربط `ProductType` | `Type`: JSON `name, nameLocalization, description, descriptionLocalization` — الربط: JSON `productId, typeId` | |
| التعبئة | `PackingType` + ربط `ProductPacking` | `PackingType`: JSON `name, nameLocalization` — الربط: `productId, packingTypeId` | |
| الفيتامينات | `Vitamin` + ربط `ProductVitamin` | `Vitamin`: multipart `Name, NameLocalization, VitaminUrlFile` — الربط: `productId, vitaminId` | |
| المعادن | `Mineral` + ربط `ProductMineral` | `Mineral`: multipart `Name, NameLocalization, MineralUrlFile` — الربط: `productId, mineralId` | |
| مواسم الحصاد | `ProductHarvestMonth` | JSON: `productId, monthStatusCode` (1–12) | |
| الشهادات | `Certification` | multipart: `Name, NameLocalization, Description, DescriptionLocalization, CertificationUrlFile` | |
| المعارض | `Exhibition` | multipart: `Name, NameLocalization, Location, Year, Description, DescriptionLocalization, ExhibitionUrlFile` | |
| الرسائل | `ContactUs` | — | List + Delete بس. |

### تأكيدات مطلوبة على الموجود

1. **جداول الربط** (`ProductType`, `ProductPacking`, `ProductVitamin`, `ProductMineral`, `ProductHarvestMonth`, `ProductVariety`):
   الـ `GetPaginatedList` لازم يقبل فلتر `productId` في الـ body، ويرجع لكل عنصر: `id` (id الربط نفسه — عشان نقدر نحذفه) + id العنصر المربوط (`typeId` / `packingTypeId` / ...) + الاسم.
2. **أسماء حقول الصور في الـ response**: احنا بنقرأ `certificationUrl`, `exhibitionUrl`, `vitaminUrl`, `mineralUrl`, و `images[].imagePath` للمنتج — لو الأسماء مختلفة ابعتها.
3. **`Exhibition/Create` و `Update`**: يقبلوا `Location` و `Year` (موجودين في الـ response بالفعل).
4. **`Product/GetById`** يرجع: `images[] (id, imagePath)`, `varieties[]`, `types[]`, `packingTypes[]`, `vitamins[]`, `minerals[]`, `harvestMonths[]` — وكل عنصر فيهم بالـ `id` بتاعه.
5. **رسائل الأخطاء** تيجي حسب `Accept-Language` (ar / en) — الداشبورد بيبعته.

---

## 3) تعديلات مطلوبة على الموجود

### Product
| الحقل / الـ Endpoint | ليه |
|---|---|
| `isVisible: bool` + `PUT Product/ToggleVisibility/{id}` (اختياري) | زرار "Show / Un Show" **شغال حاليًا من غير الباك** — الحالة متخزنة على سيرفر الموقع. لو الموقع هيترفع على Vercel (مفيش تخزين دائم) هنحتاج الحقل ده من الباك. |
| `displayOrder: int` | ترتيب المنتجات في الموقع. |
| `slug: string` (unique، إنجليزي) | لينك المنتج في الموقع `/products/{slug}` — حاليًا بنولّده من الاسم. |
| فلاتر في `GetPaginatedList`: `productCategoryId`, `showOnHome` | الصفحة الرئيسية وتابات الأقسام. |
| `ProductImage`: `displayOrder` + `PUT ProductImage/SetCover/{id}` (اختياري) | اختيار الصورة الرئيسية للمنتج. |

### ContactUs
| الحقل / الـ Endpoint | ليه |
|---|---|
| `createdAt: DateTime` في الـ response | عرض تاريخ الرسالة وترتيبها (الأحدث أولًا). |
| `isRead: bool` + `PUT ContactUs/MarkAsRead/{id}` | تمييز الرسائل الجديدة. |
| `phone`, `company`, `country` (اختياري) | بيانات أهم للعميل التصديري. |
| **إيميل تنبيه** للشركة عند وصول رسالة جديدة | عشان العميل ميضطرش يفتح الداشبورد كل شوية. |
| Rate limiting (مثلًا 5 رسائل/ساعة لكل IP) + CAPTCHA (reCAPTCHA / Turnstile) | منع السبام. |

### "Product Creative With"
كان في الداشبورد القديم زرار **Add / View Product Creative With** — **محتاجين نعرف معناه إيه بالظبط** (منتجات مقترحة؟ وصفات؟ "بيتعمل منه إيه"؟) والحقول بتاعته، وبعدها نعمله endpoint: `ProductCreativeWith` (CRUD + فلتر `productId`).

---

## 4) Endpoints جديدة — محتوى الموقع (الـ Sidebar في الداشبورد القديم)

دي الأقسام اللي ظاهرة في الداشبورد الجديد كـ "قريبًا" لحد ما الـ endpoints تجهز.
**الـ GET لازم يكون بدون توكن** لأن الموقع العام بيقرأ منها.

### 4.1 أقسام النص (Welcome / About Us / Quality / Export & Production)
اقتراح: entity واحد بمفتاح بدل 4 entities:

```
GET  SiteSection/GetByKey/{key}        key = welcome | about | quality | export
PUT  SiteSection/Update                 (multipart)
```

| الحقل | النوع |
|---|---|
| `key` | string (ثابت) |
| `title`, `titleLocalization` | string |
| `details`, `detailsLocalization` | HTML (rich text — زي "Details English" في الداشبورد القديم) |
| `image` / `ImageFile` | صورة اختيارية |
| `items[]` (اختياري) | نقاط/مميزات: `title, titleLocalization, description, descriptionLocalization, icon` — لصفحات Quality و Export |

### 4.2 Banner (سلايدر الصفحة الرئيسية)
`Banner` — CRUD كامل

| الحقل | النوع |
|---|---|
| `title`, `titleLocalization` | string |
| `subtitle`, `subtitleLocalization` | string |
| `ImageFile` / `imageUrl` | صورة (مطلوبة) |
| `buttonText`, `buttonTextLocalization`, `link` | اختياري |
| `displayOrder` | int |
| `isActive` | bool |

### 4.3 Social Media
`SocialMedia` — CRUD كامل (أو object واحد)

| الحقل | النوع |
|---|---|
| `platform` | enum: facebook, instagram, linkedin, x, youtube, tiktok, whatsapp |
| `url` | string |
| `displayOrder`, `isActive` | |

### 4.4 Meta Tags (SEO لكل صفحة)
```
GET  MetaTag/GetByPage/{page}     page = home | about | products | certifications | exhibitions | export | quality | contact
PUT  MetaTag/Update                (multipart)
```

| الحقل | النوع |
|---|---|
| `page` | string |
| `title`, `titleLocalization` | string (≤ 60 حرف) |
| `description`, `descriptionLocalization` | string (≤ 160 حرف) |
| `keywords` | string |
| `OgImageFile` / `ogImageUrl` | صورة المشاركة على السوشيال |

### 4.5 بيانات الشركة (Footer / Contact page)
```
GET  CompanySettings/Get
PUT  CompanySettings/Update
```
`phones[]`, `emails[]`, `whatsapp`, `address`, `addressLocalization`, `mapUrl`, `workingHours`, `workingHoursLocalization`, `notificationEmail` (الإيميل اللي بتوصله رسايل Contact Us).

### 4.6 Dashboard stats (اختياري — يوفّر 5 requests)
`GET Dashboard/Stats` ← `{ products, categories, certifications, exhibitions, messages, unreadMessages }`

---

## 5) متطلبات الإنتاج (Production)

1. **حجم الرفع**: السماح بصور لحد **10MB** للصورة و **25MB** للـ request (رفع كذا صورة للمنتج مرة واحدة). أنواع: jpg, png, webp.
2. **الصور**: تفضل متاحة على `/Images/...` بنفس الدومين، ويفضل `Cache-Control: public, max-age=31536000` عليها.
3. **HTTPS** + JWT secret قوي + مدة صلاحية التوكن (مثلًا 8 ساعات) و `exp` موجود في التوكن (الفرونت بيعتمد عليه في تسجيل الخروج التلقائي).
4. **الحذف**: لو حذف قسم عليه منتجات — يرجع خطأ واضح (`400` برسالة) بدل `500`.
5. **Validation errors** ترجع في `errors[]` برسائل مفهومة (عربي/إنجليزي حسب `Accept-Language`).
6. **CORS**: مش محتاجينه — كل الطلبات بتخرج من سيرفر Next.js مش من المتصفح.
7. **Logout**: `Authentication/Logout` (الفرونت بيناديه عند تسجيل الخروج — لو مش موجود مش مشكلة).

---

## 6) ملخص سريع بالأولوية

1. الـ GET العامة بدون توكن + حساب الأدمن النهائي للعميل.
2. تأكيد إن الـ endpoints في قسم 2 شغالة بتوكن الأدمن + فلتر `productId` في جداول الربط.
3. `Product.showOnHome` + `ContactUs.createdAt / isRead`.
4. Endpoints محتوى الموقع: `SiteSection`, `Banner`, `SocialMedia`, `MetaTag`, `CompanySettings`.
5. توضيح "Product Creative With".
6. متطلبات الإنتاج (حجم الرفع، rate limit، إيميل التنبيه).
