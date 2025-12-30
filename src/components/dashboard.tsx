"use client";

import * as React from "react";
import type { Task } from "@/lib/types";
import { isOverdue } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function Dashboard({ tasks }: { tasks: Task[] }) {
  const kpi = React.useMemo(() => {
    const open = tasks.filter((t) => t.status !== "Done").length;
    const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
    const criticalOpen = tasks.filter((t) => t.status !== "Done" && t.priority === "Critical").length;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const done7d = tasks.filter((t) => t.status === "Done" && new Date(t.updatedAt).getTime() >= sevenDaysAgo.getTime()).length;

    return { open, overdue, criticalOpen, done7d };
  }, [tasks]);

  const byStatus = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) map.set(t.status, (map.get(t.status) ?? 0) + 1);
    const order = ["Backlog", "InProgress", "Blocked", "OnHold", "Done"];
    return order.map((k) => ({ name: k, value: map.get(k) ?? 0 }));
  }, [tasks]);

  const byCategory = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) map.set(t.category, (map.get(t.category) ?? 0) + 1);
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [tasks]);

  const trend14d = React.useMemo(() => {
    const now = startOfDay(new Date());
    const start = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
    const days: { date: string; created: number; done: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const key = ymd(d);
      days.push({ date: key, created: 0, done: 0 });
    }
    const index = new Map(days.map((x, i) => [x.date, i]));

    for (const t of tasks) {
      const c = ymd(startOfDay(new Date(t.createdAt)));
      const di = index.get(c);
      if (di !== undefined) days[di].created += 1;

      if (t.status === "Done") {
        const u = ymd(startOfDay(new Date(t.updatedAt)));
        const ui = index.get(u);
        if (ui !== undefined) days[ui].done += 1;
      }
    }
    return days;
  }, [tasks]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>KPI snapshot + charts (local data; sync if enabled)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-200/70 p-4 dark:border-slate-700/60">
              <div className="text-xs text-gray-500 dark:text-slate-400">Open tasks</div>
              <div className="mt-1 text-2xl font-semibold">{kpi.open}</div>
            </div>
            <div className="rounded-2xl border border-gray-200/70 p-4 dark:border-slate-700/60">
              <div className="text-xs text-gray-500 dark:text-slate-400">Overdue</div>
              <div className="mt-1 text-2xl font-semibold">{kpi.overdue}</div>
            </div>
            <div className="rounded-2xl border border-gray-200/70 p-4 dark:border-slate-700/60">
              <div className="text-xs text-gray-500 dark:text-slate-400">Critical (open)</div>
              <div className="mt-1 text-2xl font-semibold">{kpi.criticalOpen}</div>
            </div>
            <div className="rounded-2xl border border-gray-200/70 p-4 dark:border-slate-700/60">
              <div className="text-xs text-gray-500 dark:text-slate-400">Done (last 7d)</div>
              <div className="mt-1 text-2xl font-semibold">{kpi.done7d}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By Status</CardTitle>
          <CardDescription>Distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide={false} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
          <CardDescription>Top 10</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>14-day Trend</CardTitle>
          <CardDescription>Created vs Done per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend14d} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="created" fillOpacity={0.15} />
                <Area type="monotone" dataKey="done" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
