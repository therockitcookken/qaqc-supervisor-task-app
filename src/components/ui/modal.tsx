import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className={cn("flex items-start justify-between gap-4 border-b border-gray-200/70 px-5 py-4 dark:border-slate-700/60")}>
          <div>
            <div className="text-lg font-semibold">{title}</div>
            {description ? <div className="mt-1 text-sm text-gray-500 dark:text-slate-400">{description}</div> : null}
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-gray-200/70 px-5 py-4 dark:border-slate-700/60">{footer}</div> : null}
      </div>
    </div>
  );
}
