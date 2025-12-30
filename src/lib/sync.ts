import type { AppMeta, SyncResult, Task } from "./types";

export type SyncMode = "local" | "supabase";

export function getSyncMode(): SyncMode {
  const mode = process.env.NEXT_PUBLIC_SYNC_MODE;
  if (mode === "supabase") return "supabase";
  return "local";
}

export async function syncNow(args: {
  meta: AppMeta;
  tasks: Task[];
}): Promise<{ meta: AppMeta; tasks: Task[]; result?: SyncResult; warning?: string }>
{
  const { meta, tasks } = args;
  if (getSyncMode() === "local") {
    return {
      meta,
      tasks,
      warning:
        "SYNC_MODE=local: dữ liệu chỉ lưu trên thiết bị. Muốn đồng bộ đa thiết bị, cấu hình NEXT_PUBLIC_SYNC_MODE=supabase + SUPABASE env (xem README).",
    };
  }

  const workspaceId = meta.workspaceId;
  const since = meta.lastSyncAt ?? "1970-01-01T00:00:00.000Z";

  // 1) PULL
  const pullRes = await fetch(`/api/sync?workspaceId=${encodeURIComponent(workspaceId)}&since=${encodeURIComponent(since)}`);
  if (!pullRes.ok) {
    return { meta, tasks, warning: `Sync pull failed: ${pullRes.status} ${pullRes.statusText}` };
  }
  const pullData = (await pullRes.json()) as { tasks: Task[]; serverTime: string };

  // 2) MERGE (LWW by updatedAt)
  const map = new Map<string, Task>();
  for (const t of tasks) map.set(t.id, t);
  for (const t of pullData.tasks ?? []) {
    const cur = map.get(t.id);
    if (!cur || new Date(t.updatedAt).getTime() > new Date(cur.updatedAt).getTime()) {
      map.set(t.id, t);
    }
  }
  const merged = Array.from(map.values());

  // 3) PUSH (only tasks updated since 'since' OR not existing on server)
  const changed = merged.filter((t) => new Date(t.updatedAt).getTime() > new Date(since).getTime());
  const pushRes = await fetch(`/api/sync?workspaceId=${encodeURIComponent(workspaceId)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tasks: changed }),
  });
  if (!pushRes.ok) {
    return { meta, tasks: merged, warning: `Sync push failed: ${pushRes.status} ${pushRes.statusText}` };
  }
  const pushData = (await pushRes.json()) as SyncResult;

  const newMeta: AppMeta = {
    ...meta,
    lastSyncAt: pushData.serverTime,
  };

  return { meta: newMeta, tasks: merged, result: pushData };
}
