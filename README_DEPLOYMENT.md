# 🏃 PineTrace - Deployment Guide

## ✅ Push to GitHub thành công!

Dự án PineTrace đã được đẩy lên GitHub repository: https://github.com/Linh-nood/PineTrace.git

---

## 📦 Các files/folders được push

```
✓ Frontend (Next.js + React)
  - app/                    (Pages, components, API routes)
  - public/                 (Static files)
  - middleware.ts           (Route protection)
  - package.json            (Dependencies)
  - tsconfig.json           (TypeScript config)
  - next.config.ts          (Next.js config)

✓ Backend (Supabase)
  - supabase/seed.sql       (Database schema + RLS policies)
  - supabase/config.toml    (Supabase CLI config)

✓ Configuration
  - .gitignore              (Git ignore rules)
  - eslint.config.mjs       (ESLint rules)
  - postcss.config.mjs      (PostCSS config)
```

---

## 🚀 Cách clone và chạy dự án

### 1. Clone repository
```bash
git clone https://github.com/Linh-nood/PineTrace.git
cd PineTrace
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình environment variables
Tạo file `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Strava OAuth
NEXT_PUBLIC_STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret

# Callback URL
NEXT_PUBLIC_STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/callback/strava
```

### 4. Setup Supabase local (tuỳ chọn)
```bash
# Khởi động Supabase local
supabase start

# Chạy migrations và seed
supabase db reset
```

### 5. Chạy development server
```bash
npm run dev
```
Truy cập: http://localhost:3000

---

## 📊 Cấu trúc Database

### Bảng: `profiles`
- Lưu trữ thông tin người dùng và Strava tokens
- RLS policies: Users chỉ xem/sửa profile của chính họ

### Bảng: `activities`
- Lưu trữ hoạt động chạy bộ từ Strava
- RLS policies: Users chỉ xem hoạt động của chính họ

Chi tiết schema trong: `supabase/seed.sql`

---

## 🔐 Bảo mật

✓ Row Level Security (RLS) được bật trên tất cả bảng  
✓ Supabase Auth với email verification  
✓ Strava OAuth 2.0 integration  
✓ API route protection với `auth.uid()`  
✓ Sensitive tokens lưu trong environment variables  

---

## 📁 Commit History

Dự án hiện có **1 initial commit** gồm toàn bộ codebase:

```
feat: Complete PineTrace application with Strava integration
- Setup Next.js with TypeScript and Tailwind CSS
- Implement Supabase authentication
- Integrate Strava API for activity syncing
- Create dashboard with activity map
- Add profile management and settings pages
- Configure database schema with RLS policies
- Add seed data for testing
```

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL), Next.js API Routes
- **Authentication:** Supabase Auth, Strava OAuth
- **Maps:** Leaflet (for polyline visualization)
- **Language:** Vietnamese localization

---

## 📝 Thông tin thêm

📌 **Folder structure:**
```
PineTrace/
├── app/
│   ├── api/              (API Routes)
│   ├── components/       (React Components)
│   ├── dashboard/        (Dashboard page)
│   ├── login/            (Login page)
│   ├── signup/           (Signup page)
│   ├── profile/          (Profile page)
│   ├── settings/         (Settings page)
│   └── utils/            (Utilities)
├── supabase/
│   ├── config.toml       (Supabase config)
│   └── seed.sql          (Database schema)
├── public/               (Static files)
└── package.json
```

---

## 📧 Contributors
- Author: Linh Nood
- GitHub: https://github.com/Linh-nood/PineTrace

---

🎉 **Push thành công! Dự án sẵn sàng cho production!**
