export const TASK_CATEGORIES = [
  "NC", "CAPA", "Audit", "Training", "DocumentControl",
  "Supplier", "Customer", "KPI", "Improvement", "Other",
] as const;

export const TASK_PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

export const TASK_STATUSES = ["Backlog", "InProgress", "Blocked", "OnHold", "Done"] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

export type Task = {
  workspace_id: string;
  id: string;

  task_seq?: number | null;
  task_no?: string | null;

  title: string;
  description?: string | null;

  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;

  owner?: string | null;
  due_date?: string | null; // ISO date (YYYY-MM-DD)

  source?: string | null;   // Internal/Customer/Supplier/Audit/Process (string MVP)
  plant?: string | null;
  line?: string | null;

  blocked_reason?: string | null;

  verified_by?: string | null;
  verified_at?: string | null;
  closed_at?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};
