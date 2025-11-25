# إعداد GitHub Secrets و Variables

هذا الدليل يوضح كيفية إعداد GitHub Secrets و Variables للمشروع.

## الخطوات:

### 1. اذهب إلى Repository الخاص بك على GitHub

1. افتح المتصفح واذهب إلى: `https://github.com/YOUR_USERNAME/weekly-report-system`
   (استبدل `YOUR_USERNAME` باسم المستخدم الخاص بك)

2. تأكد أنك في نفس المشروع (repository) الذي يحتوي على الكود

### 2. اذهب إلى Settings

1. في صفحة الـ repository، اضغط على تبويب **Settings** (في الأعلى بجانب Code, Issues, Pull requests, إلخ)

2. إذا لم ترى تبويب Settings، تأكد أنك:
   - مالك الـ repository، أو
   - لديك صلاحيات Admin على الـ repository

### 3. اذهب إلى Secrets and variables

1. في القائمة الجانبية اليسرى، ابحث عن **Secrets and variables**
2. اضغط على **Actions** (تحت Secrets and variables)

### 4. أضف Secrets

اضغط على **New repository secret** وأضف التالي:

#### Secrets المطلوبة:

1. **DOCKER_HUB_USERNAME**
   - Name: `DOCKER_HUB_USERNAME`
   - Secret: اسم المستخدم في Docker Hub

2. **DOCKER_HUB_ACCESS_TOKEN**
   - Name: `DOCKER_HUB_ACCESS_TOKEN`
   - Secret: Access Token من Docker Hub
   - كيفية الحصول عليه:
     - اذهب إلى Docker Hub → Account Settings → Security
     - اضغط New Access Token
     - انسخ الـ token (سيظهر مرة واحدة فقط!)

3. **VAGRANT_VM_HOST**
   - Name: `VAGRANT_VM_HOST`
   - Secret: IP address للـ Vagrant VM (مثلاً: `192.168.56.10`)

4. **VAGRANT_VM_USER**
   - Name: `VAGRANT_VM_USER`
   - Secret: `vagrant` (عادة)

5. **VAGRANT_VM_SSH_KEY**
   - Name: `VAGRANT_VM_SSH_KEY`
   - Secret: محتوى الملف `~/.ssh/id_rsa` (الـ private key)
   - للحصول عليه:
     ```bash
     cat ~/.ssh/id_rsa
     ```
   - انسخ المحتوى كاملاً (بما في ذلك `-----BEGIN OPENSSH PRIVATE KEY-----` و `-----END OPENSSH PRIVATE KEY-----`)

6. **VAGRANT_VM_PORT** (اختياري)
   - Name: `VAGRANT_VM_PORT`
   - Secret: `22` (عادة)

### 5. أضف Variables

1. في نفس الصفحة، اضغط على تبويب **Variables**
2. اضغط على **New repository variable**

#### Variables المطلوبة:

1. **DOCKER_HUB_USERNAME**
   - Name: `DOCKER_HUB_USERNAME`
   - Value: اسم المستخدم في Docker Hub (نفس القيمة المستخدمة في Secrets)

## ملاحظات مهمة:

- **Secrets** تكون مخفية ولا يمكن رؤيتها بعد الحفظ (للمعلومات الحساسة مثل passwords و tokens)
- **Variables** يمكن رؤيتها ولكن لا يمكن تعديلها من الـ workflow (للمعلومات غير الحساسة)
- تأكد من إضافة جميع الـ Secrets قبل push الكود إلى main branch (لأن الـ CD workflow سيعمل تلقائياً)

## التحقق من الإعداد:

بعد إضافة جميع الـ Secrets و Variables:

1. اذهب إلى تبويب **Actions** في الـ repository
2. اضغط على أي workflow
3. إذا كان هناك خطأ متعلق بـ Secrets، ستظهر رسالة خطأ واضحة

## مثال على الصفحة:

```
Repository: weekly-report-system
├── Code
├── Issues
├── Pull requests
├── Actions
└── Settings  ← اضغط هنا
    ├── General
    ├── Access
    ├── Secrets and variables  ← اضغط هنا
    │   └── Actions  ← اضغط هنا
    │       ├── Secrets (تبويب)
    │       └── Variables (تبويب)
    └── ...
```

## نصيحة:

إذا كنت تريد اختبار الـ workflows قبل إضافة جميع الـ Secrets:
- يمكنك تعطيل الـ CD workflow مؤقتاً
- أو إضافة Secrets وهمية للاختبار (لكن الـ deployment لن يعمل)































