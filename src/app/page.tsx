"use client";

import * as React from "react";
import { Download, Upload, Plus, RefreshCw, Settings2, ListTodo, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Dashboard } from "@/components/dashboard";
import { TaskTable, type Filters } from "@/components/task-table";
import { TaskForm } from "@/components/task-form";
import type { Task } from "@/lib/types";
import { exportJson, importJson, loadMeta, loadTasks, saveMeta, saveTasks } from "@/lib/storage";
import { getSyncMode, syncNow } from "@/lib/sync";
import { cn, todayYMD, toISO } from "@/lib/utils";

type Tab = "tasks" | "dashboard" | "settings";

function seed(workspaceId: string): Task[] {
  const now = toISO(new Date());
  return [
    {
      id: "seed_1",
      workspaceId,
      title: "Close 8D: leak escape after 100% screening",
      description: "Verify leak mechanism, validate test capability (MSA), update SOP/Control Plan, confirm effectiveness 60 days.",
      category: "CAPA",
      status: "InProgress",
      priority: "High",
      owner: "QA Supervisor",
      dept: "QA",
      dueDate: todayYMD(),
      tags: ["leak", "8D", "escape", "LPA"],
      relatedNcNo: "NC-2025-0012",
      relatedCapaNo: "CAPA-2025-0008",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed_2",
      workspaceId,
      title: "LPA: seam thickness & overlap check - Line P3145",
      description: "Set layered audit frequency, checklist, and escalation for NG trend.",
      category: "Audit",
      status: "Backlog",
      priority: "Medium",
      owner: "QA",
      dept: "QA",
      dueDate: todayYMD(),
      tags: ["LPA", "seam"],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export default function HomePage() {
  const [tab, setTab] = React.useState<Tab>("tasks");

  const [meta, setMeta] = React.useState(() => loadMeta());
  const [tasks, setTasks] = React.useState<Task[]>(() => {
    const t = loadTasks();
    return t.length ? t : seed(loadMeta().workspaceId);
  });

  const [filters, setFilters] = React.useState<Filters>({
    q: "",
    status: "",
    category: "",
    priority: "",
    onlyOverdue: false,
  });

  const [isModalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | null>(null);

  const [syncInfo, setSyncInfo] = React.useState<string>("");

  // persist local
  React.useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  React.useEffect(() => {
    saveMeta(meta);
  }, [meta]);

  function upsertTask(t: Task) {
    setTasks((prev) => {
      const idx = prev.findIndex((x) => x.id === t.id);
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = t;
        return next;
      }
      return [t, ...prev];
    });
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function doSync() {
    setSyncInfo("Syncing...");
    const out = await syncNow({ meta, tasks });
    if (out.warning) setSyncInfo(out.warning);
    else if (out.result) setSyncInfo(`OK. Pushed=${out.result.pushed}, serverTime=${out.result.serverTime}`);
    setMeta(out.meta);
    setTasks(out.tasks);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200/70 bg-white/70 backdrop-blur dark:border-slate-700/60 dark:bg-slate-950/60">
        <div className="container-app py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xl font-semibold">QA Supervisor Task Hub</div>
              <div className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
                Tasks • Filters • Dashboard • Export/Import • Optional cross-device sync
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn-primary"
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                New task
              </button>

              <button className="btn-ghost" onClick={doSync} title="Sync now">
                <RefreshCw className="h-4 w-4" />
                Sync
              </button>

              <button
                className="btn-ghost"
                onClick={() => exportJson(tasks, meta)}
                title="Export JSON"
              >
                <Download className="h-4 w-4" />
                Export
              </button>

              <label className="btn-ghost cursor-pointer" title="Import JSON">
                <Upload className="h-4 w-4" />
                Import
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const res = await importJson(f).catch(() => null);
                    if (!res) return;
                    if (res.meta?.workspaceId) setMeta((m) => ({ ...m, ...res.meta }));
                    if (Array.isArray(res.tasks)) setTasks(res.tasks);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              className={cn("btn-ghost", tab === "tasks" ? "border-blue-200 dark:border-blue-500/30" : "")}
              onClick={() => setTab("tasks")}
            >
              <ListTodo className="h-4 w-4" />
              Tasks
            </button>
            <button
              className={cn("btn-ghost", tab === "dashboard" ? "border-blue-200 dark:border-blue-500/30" : "")}
              onClick={() => setTab("dashboard")}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </button>
            <button
              className={cn("btn-ghost", tab === "settings" ? "border-blue-200 dark:border-blue-500/30" : "")}
              onClick={() => setTab("settings")}
            >
              <Settings2 className="h-4 w-4" />
              Settings
            </button>

            <div className="ml-auto text-xs text-gray-500 dark:text-slate-400">
              Workspace: <span className="font-medium">{meta.workspaceId}</span> • Sync mode: <span className="font-medium">{getSyncMode()}</span>
              {meta.lastSyncAt ? (
                <span>
                  {" "}
                  • Last sync: <span className="font-medium">{meta.lastSyncAt}</span>
                </span>
              ) : null}
            </div>
          </div>

          {syncInfo ? (
            <div className="mt-2 text-xs text-gray-500 dark:text-slate-400">{syncInfo}</div>
          ) : null}
        </div>
      </header>

      <main className="container-app py-6">
        {tab === "tasks" ? (
          <Card>
            <CardHeader>
              <CardTitle>Task List</CardTitle>
              <CardDescription>
                Lưu local tự động. Nhấn Sync nếu bạn đã cấu hình cloud.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskTable
                tasks={tasks}
                filters={filters}
                onFilters={setFilters}
                onEdit={(t) => {
                  setEditing(t);
                  setModalOpen(true);
                }}
                onDelete={(id) => {
                  if (confirm("Delete this task?")) deleteTask(id);
                }}
              />
            </CardContent>
          </Card>
        ) : null}

        {tab === "dashboard" ? <Dashboard tasks={tasks} /> : null}

        {tab === "settings" ? (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Workspace & sync configuration (audit-friendly)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Workspace ID</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    Dùng để đồng bộ giữa các thiết bị. Đặt cùng 1 Workspace ID trên mọi thiết bị.
                  </div>
                  <input
                    className="input"
                    value={meta.workspaceId}
                    onChange={(e) => setMeta((m) => ({ ...m, workspaceId: e.target.value.trim() }))}
                  />
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    Gợi ý: ws_qa_{new Date().getFullYear()}_{Math.random().toString(16).slice(2, 6)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Sync mode</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    Hiện tại: <b>{getSyncMode()}</b>. Nếu muốn sync đa thiết bị: cấu hình Supabase theo README.
                  </div>
                  <button className="btn-primary" onClick={doSync}>
                    <RefreshCw className="h-4 w-4" />
                    Sync now
                  </button>
                </div>

                <div className="md:col-span-2 rounded-2xl border border-gray-200/70 p-4 text-sm dark:border-slate-700/60">
                  <div className="font-medium">Definition of Done (for build/deploy)</div>
                  <ul className="mt-2 list-disc pl-5 text-gray-600 dark:text-slate-300">
                    <li>npm run build PASS local</li>
                    <li>npx vercel build --prod PASS</li>
                    <li>API /api/sync trả 400 có message rõ nếu chưa set env</li>
                    <li>Không TypeScript error / import error</li>
                    <li>Data persist local, export/import OK, sync OK khi có Supabase</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>

      <Modal
        open={isModalOpen}
        title={editing ? "Edit task" : "New task"}
        description={editing ? `ID: ${editing.id}` : `Workspace: ${meta.workspaceId}`}
        onClose={() => setModalOpen(false)}
      >
        <TaskForm
          mode={editing ? "edit" : "create"}
          workspaceId={meta.workspaceId}
          initial={editing ?? undefined}
          onCancel={() => setModalOpen(false)}
          onSave={(t) => {
            upsertTask(t);
            // Optional auto-sync after save (safe, no-op in local mode)
            setSyncInfo("Saved locally.");
          }}
        />
      </Modal>

      <footer className="container-app pb-8 text-xs text-gray-500 dark:text-slate-400">
        Tip: Nếu bạn dùng Vercel + Supabase sync, nhớ set Node LTS (20/22) và environment variables trong Vercel.
      </footer>
    </div>
  );
}
