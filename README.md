# Serenity

Ứng dụng web tiếng Việt giúp người dùng check-in cảm xúc, tự phản tư qua tranh gợi mở và nhận nội dung phù hợp. Serenity là công cụ wellbeing, không phải công cụ chẩn đoán hoặc điều trị.

## Chức năng v1

- Check-in năm bước, mô tả tranh là tín hiệu NLP chính.
- Gemini structured output, scoring tại backend và safety routing.
- Kết quả, feedback, nhạc/podcast/grounding.
- Dashboard, lịch sử, export/xóa dữ liệu local.
- Admin Console quản lý bộ tranh và bộ câu hỏi.
- Supabase Auth, schema, RLS, Storage và mã hóa văn bản trước khi lưu.
- Đăng ký/đăng nhập bằng email và mật khẩu; tên hiển thị được lưu trong hồ sơ.
- Nhạc nền toàn ứng dụng, phát lặp ở âm lượng 50% sau tương tác đầu tiên và có nút bật/tắt.
- Demo local chạy không cần tài khoản/key.

## 1. Chạy local ngay

Yêu cầu Node.js 20.9 trở lên.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Giữ cấu hình sau trong `.env.local` để chạy demo không cần dịch vụ bên ngoài:

```text
NEXT_PUBLIC_DEMO_MODE=true
```

Mở `http://localhost:3000`. Các route hữu ích:

- `/check-in`: luồng check-in hoàn chỉnh.
- `/dashboard`, `/history`, `/settings`: khu vực người dùng.
- `/admin`: Admin Console demo local.

## 2. Kết nối Supabase

1. Tạo project tại Supabase Dashboard.
2. Mở SQL Editor, chạy theo thứ tự:
   - `supabase/migrations/202609220001_initial_schema.sql`
   - `supabase/seed.sql`
3. Trong Authentication → URL Configuration:
   - Site URL local: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`
4. Lấy Project URL và anon/publishable key trong Project Settings → API.
5. Điền `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_DEMO_MODE=false
```

6. Đăng nhập một lần để trigger tạo `profiles`, sau đó cấp admin trong SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = '<UUID_USER_TRONG_AUTH_USERS>';
```

Không đặt secret/service-role key trong biến `NEXT_PUBLIC_*` và không commit `.env.local`. Serenity v1 không cần secret key của Supabase.

Ứng dụng dùng email + mật khẩu. Trong lúc thử nghiệm có thể tắt **Confirm email** tại Authentication → Sign In / Providers → Email. Khi production, bật xác minh email và cấu hình custom SMTP.

## 3. Kết nối Gemini

Tạo API key trong Google AI Studio và điền:

```text
GEMINI_API_KEY=YOUR_GEMINI_KEY
GEMINI_MODEL=gemini-3.5-flash
```

Model là biến cấu hình để có thể thay đổi mà không sửa code. API chỉ được gọi tại server route `/api/analyze`.

Tạo khóa mã hóa dài, ngẫu nhiên cho dữ liệu văn bản:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Đặt kết quả vào `TEXT_ENCRYPTION_KEY` và khởi động lại local server.

## 4. Kiểm tra trước khi deploy

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 5. Deploy Vercel

1. Push nhánh đã kiểm tra lên GitHub.
2. Vào Vercel → Add New Project → import repository Serenity.
3. Framework preset: Next.js; giữ build command `npm run build`.
4. Thêm toàn bộ biến môi trường cho Production/Preview.
5. Đặt `NEXT_PUBLIC_DEMO_MODE=false` trên Vercel.
6. Deploy và lấy domain, ví dụ `https://serenity-example.vercel.app`.
7. Trong Supabase Authentication → URL Configuration, đổi Site URL sang domain Vercel và thêm `https://serenity-example.vercel.app/auth/callback` vào Redirect URLs.
8. Redeploy, rồi kiểm tra đăng nhập, check-in, safety route, lịch sử và quyền admin.

## Scripts

| Command | Mục đích |
| --- | --- |
| `npm run dev` | Chạy local |
| `npm run lint` | Kiểm tra ESLint |
| `npm run typecheck` | Kiểm tra TypeScript |
| `npm test` | Unit tests scoring/safety |
| `npm run build` | Production build |

## Bảo mật

- Không commit `.env.local`, API keys hoặc dữ liệu người dùng.
- RLS phải được bật; user thường không được truy cập admin API/content draft.
- Nội dung nhạy cảm được mã hóa AES-256-GCM ở server trước khi lưu.
- Safety screen không thay thế dịch vụ khẩn cấp hay chuyên gia sức khỏe tâm thần.
