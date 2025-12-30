import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge(
  props: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "success" | "warn" | "danger" | "info" }
) {
  const { className, tone = "neutral", ...rest } = props;

  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
      : tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
      : tone === "danger"
      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
      : tone === "info"
      ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
      : "border-gray-200 bg-gray-50 text-gray-700 dark:border-slate-600/60 dark:bg-slate-800 dark:text-slate-200";

  return <span className={cn("badge", toneClass, className)} {...rest} />;
}
