import { safeJsonParse, todayYMD, uniqStrings } from "./utils";
import type { AppMeta, Task } from "./types";

const TASKS_KEY = "qaqc_tasks_v1";
const META_KEY = "qaqc_meta_v1";

export function defaultWorkspaceId() {
  // stable-ish across refreshes, but user can override in Settings
  return `ws_${todayYMD().replace(/-/g, "")}`;
}

export function loadMeta(): AppMeta {
  if (typeof window === "undefined") {
    return { version: 1, workspaceId: defaultWorkspaceId() };
  }
  const raw = window.localStorage.getItem(META_KEY);
  const meta = safeJsonParse<AppMeta | null>(raw ?? "null", null);
  if (meta && meta.workspaceId) return meta;
  const fresh: AppMeta = { version: 1, workspaceId: defaultWorkspaceId() };
  window.localStorage.setItem(META_KEY, JSON.stringify(fresh));
  return fresh;
}

export function saveMeta(meta: AppMeta) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(TASKS_KEY);
  const tasks = safeJsonParse<Task[]>(raw ?? "[]", []);
  return Array.isArray(tasks) ? tasks : [];
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function exportJson(tasks: Task[], meta: AppMeta) {
  const payload = { meta, tasks };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `qaqc_tasks_export_${todayYMD()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJson(file: File): Promise<{ meta?: AppMeta; tasks?: Task[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result ?? "{}"));
        resolve({ meta: obj?.meta, tasks: obj?.tasks });
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function normalizeTags(s: string): string[] {
  return uniqStrings(
    s
      .split(/[,;\n]/g)
      .map((x) => x.trim())
      .filter(Boolean)
  );
}
