-- QAQC Supervisor Task Hub - Supabase schema
-- Create table + index for cross-device sync via /api/sync

create table if not exists public.qaqc_tasks (
  workspace_id text not null,
  id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payload jsonb not null,
  primary key (workspace_id, id)
);

create index if not exists qaqc_tasks_ws_updated_idx
on public.qaqc_tasks (workspace_id, updated_at);

-- Notes:
-- 1) /api/sync uses UPSERT on (workspace_id,id) and expects updated_at in ISO.
-- 2) For higher security, implement Supabase Auth + RLS policies instead of workspace_id-only partitioning.
