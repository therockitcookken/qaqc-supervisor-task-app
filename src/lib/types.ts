export const TASK_CATEGORIES = [
  "NC",
  "CAPA",
  "Audit",
  "Training",
  "DocumentControl",
  "Supplier",
  "Customer",
  "KPI",
  "Improvement",
  "Other",
] as const;

export const TASK_STATUSES = [
  "Backlog",
  "InProgress",
  "Blocked",
  "OnHold",
  "Done",
] as const;

export const TASK_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type Task = {
  id: string;
  workspaceId: string; // used for optional sync partition
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  owner: string;
  dept: string;
  dueDate: string; // YYYY-MM-DD
  tags: string[];
  evidenceUrl?: string;
  relatedNcNo?: string;
  relatedCapaNo?: string;

  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type AppMeta = {
  version: number;
  workspaceId: string;
  lastSyncAt?: string;
};

export type SyncResult = {
  pushed: number;
  pulled: number;
  serverTime: string;
};
