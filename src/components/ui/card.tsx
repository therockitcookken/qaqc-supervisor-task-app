import * as React from "react";
import { cn } from "@/lib/utils";

export function Card(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const { className, ...rest } = props;
  return <div className={cn("card", className)} {...rest} />;
}

export function CardHeader(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const { className, ...rest } = props;
  return <div className={cn("border-b border-gray-200/70 px-5 py-4 dark:border-slate-700/60", className)} {...rest} />;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-lg font-semibold", className)}>{children}</div>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mt-1 text-sm text-gray-500 dark:text-slate-400", className)}>{children}</div>;
}

export function CardContent(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const { className, ...rest } = props;
  return <div className={cn("px-5 py-4", className)} {...rest} />;
}
