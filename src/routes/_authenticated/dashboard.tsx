import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  UserCheck,
  Building2,
  Activity as ActivityIcon,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "@/lib/employee-schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Activity = {
  id: string;
  action: string;
  target: string | null;
  created_at: string;
};

function Dashboard() {
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Employee[];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as unknown as Activity[];
    },
  });

  const total = employees.length;
  const active = employees.filter((e) => e.status === "Active").length;
  const departments = new Set(employees.map((e) => e.department)).size;

  const stats = [
    {
      label: "Total Employees",
      value: total,
      icon: Users,
      hint: "All records",
    },
    {
      label: "Active",
      value: active,
      icon: UserCheck,
      hint: `${total - active} inactive`,
    },
    {
      label: "Departments",
      value: departments,
      icon: Building2,
      hint: "Unique teams",
    },
    {
      label: "Recent Actions",
      value: activities.length,
      icon: ActivityIcon,
      hint: "Last 8 events",
    },
  ];

  const byDept = Object.entries(
    employees.reduce<Record<string, number>>((acc, e) => {
      acc[e.department] = (acc[e.department] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const maxDept = Math.max(1, ...byDept.map(([, n]) => n));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your workforce and recent activity.
          </p>
        </div>
        <Link
          to="/employees/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-brand transition hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" /> Add employee
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="relative overflow-hidden border-border/60 p-5 shadow-soft"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-brand opacity-10 blur-2xl" />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="mt-2 text-3xl font-black tracking-tight">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand-soft text-primary">
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Department distribution</h2>
              <p className="text-xs text-muted-foreground">
                Employees per department
              </p>
            </div>
            <Link
              to="/reports"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View reports <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {byDept.length === 0 ? (
            <EmptyHint />
          ) : (
            <div className="space-y-3">
              {byDept.map(([name, count]) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{name}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-brand"
                      style={{ width: `${(count / maxDept) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 shadow-soft">
          <h2 className="text-lg font-bold">Recent activity</h2>
          <p className="text-xs text-muted-foreground">Latest admin actions</p>
          <ul className="mt-4 space-y-3">
            {activities.length === 0 && <EmptyHint />}
            {activities.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gradient-brand" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-medium">{a.action}</span>
                    {a.target ? (
                      <span className="text-muted-foreground"> · {a.target}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(a.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recently added employees</h2>
          <Link
            to="/employees"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {employees.length === 0 ? (
          <EmptyHint />
        ) : (
          <ul className="divide-y divide-border/60">
            {employees.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center gap-4 py-3">
                <Avatar name={e.full_name} url={e.photo_url} />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/employees/$id"
                    params={{ id: e.id }}
                    className="truncate font-medium hover:underline"
                  >
                    {e.full_name}
                  </Link>
                  <div className="truncate text-xs text-muted-foreground">
                    {e.job_role} · {e.department}
                  </div>
                </div>
                <Badge
                  variant={e.status === "Active" ? "default" : "secondary"}
                  className={
                    e.status === "Active"
                      ? "bg-gradient-brand text-primary-foreground"
                      : ""
                  }
                >
                  {e.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
      No data yet — add your first employee to see insights here.
    </div>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-primary-foreground">
      {initials}
    </div>
  );
}
