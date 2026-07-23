import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "@/lib/employee-schema";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/reports")({
  component: Reports,
});

const COLORS = ["#7c3aed", "#6366f1", "#3b82f6", "#8b5cf6", "#a855f7", "#4f46e5", "#0ea5e9"];

function Reports() {
  const { data = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees" as never).select("*");
      if (error) throw error;
      return (data ?? []) as unknown as Employee[];
    },
  });

  const byDept = Object.entries(
    data.reduce<Record<string, number>>((acc, e) => {
      acc[e.department] = (acc[e.department] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, count]) => ({ name, count }));

  const byStatus = [
    { name: "Active", value: data.filter((e) => e.status === "Active").length },
    { name: "Inactive", value: data.filter((e) => e.status === "Inactive").length },
  ];

  const totalPayroll = data.reduce((s, e) => s + Number(e.salary), 0);
  const avgSalary = data.length ? totalPayroll / data.length : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Snapshots of your organization at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total employees" value={data.length.toString()} />
        <Stat label="Total payroll" value={`$${totalPayroll.toLocaleString()}`} />
        <Stat
          label="Average salary"
          value={`$${avgSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">Headcount by department</h2>
          <div className="h-72">
            {byDept.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDept}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="count" fill="var(--brand)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">Active vs Inactive</h2>
          <div className="h-72">
            {data.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </Card>
  );
}
function Empty() {
  return (
    <div className="grid h-full place-items-center text-sm text-muted-foreground">
      No data yet.
    </div>
  );
}
