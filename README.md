# QA Supervisor Task Hub (Next.js + TypeScript)

Personal task app kiểu **QA Supervisor**: quản lý task (NC/CAPA/Audit/Training/Doc Control...), lọc & search, dashboard biểu đồ, export/import JSON, và **tùy chọn đồng bộ đa thiết bị** qua Supabase.

## 1) Quick start (Local)

> Khuyến nghị Node LTS **20/22**. (Repo có `engines` để tránh Node 24 gây lỗi toolchain.)

```bash
npm install
npm run dev
```

Build:
```bash
npm run build
npm run start
```

## 2) Data model (Local-first)
- Dữ liệu mặc định lưu **localStorage** (`qaqc_tasks_v1`, `qaqc_meta_v1`).
- App vẫn chạy mượt và không crash kể cả khi **chưa bật sync**.
- Export/import JSON để backup / chuyển nhanh.

## 3) Cross-device sync (Supabase) — tùy chọn

### 3.1 Tạo bảng
Trong Supabase SQL editor, chạy file `supabase/schema.sql` (copy/paste), hoặc chạy nhanh đoạn sau:
```sql
create table if not exists public.qaqc_tasks (
  workspace_id text not null,
  id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null,
  payload jsonb not null,
  primary key (workspace_id, id)
);

create index if not exists qaqc_tasks_ws_updated_idx
on public.qaqc_tasks (workspace_id, updated_at);
```

### 3.2 Env vars
Tạo file `.env.local`:
```bash
NEXT_PUBLIC_SYNC_MODE=supabase
SUPABASE_URL=... 
# Khuyến nghị dùng service role key (server only)
SUPABASE_SERVICE_ROLE_KEY=...
# (hoặc) SUPABASE_ANON_KEY=...
```

> **Workspace ID**: vào tab Settings, đặt cùng 1 Workspace ID trên mọi thiết bị.

### 3.3 Deploy Vercel
- Import repo lên Vercel.
- Set Environment Variables (Production + Preview nếu cần):
  - `NEXT_PUBLIC_SYNC_MODE=supabase`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (recommended)
- Project Settings → Node.js Version: chọn **20 hoặc 22**.

## 4) Zero-error build/deploy runbook (PowerShell)
```powershell
node -v
npm -v

# clean
if (Test-Path .next) { rmdir .next -Recurse -Force }

npm install
npm run build

npx vercel -v
npx vercel pull --yes --environment=production
npx vercel build --prod
npx vercel deploy --prebuilt --prod
```

## 5) Notes (audit-friendly)
- Merge/sync dùng cơ chế **LWW** theo `updatedAt` (Last-Write-Wins).
- API `/api/sync` trả lỗi 400 có message rõ nếu chưa cấu hình Supabase.

---

If you want: mình có thể nâng cấp thành hệ thống “QA Supervisor Suite” gồm: NC/CAPA registry, training matrix, sample retention, LPA checklists, KPI dashboard.
