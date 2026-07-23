import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity";
import type { Employee } from "@/lib/employee-schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/employees/$id")({
  component: EmployeeProfile,
});

function EmployeeProfile() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["employee", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees" as never)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as Employee | null;
    },
  });

  if (isLoading) {
    return <div className="mx-auto max-w-4xl text-sm text-muted-foreground">Loading…</div>;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl">
        <Link to="/employees" className="text-sm text-primary hover:underline">
          ← Back to employees
        </Link>
        <p className="mt-6 text-sm text-muted-foreground">Employee not found.</p>
      </div>
    );
  }

  const handleDelete = async () => {
    const { error } = await supabase.from("employees" as never).delete().eq("id", data.id);
    if (error) return toast.error(error.message);
    await logActivity("Deleted employee", `${data.full_name} (${data.employee_id})`);
    toast.success("Employee deleted");
    qc.invalidateQueries({ queryKey: ["employees"] });
    navigate({ to: "/employees", replace: true });
  };

  const initials = data.full_name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/employees"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to employees
      </Link>

      <Card className="relative overflow-hidden p-0 shadow-soft">
        <div className="h-32 bg-gradient-brand" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              {data.photo_url ? (
                <img
                  src={data.photo_url}
                  alt={data.full_name}
                  className="h-24 w-24 rounded-2xl border-4 border-background object-cover shadow-brand"
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-background bg-gradient-brand text-2xl font-black text-primary-foreground shadow-brand">
                  {initials}
                </div>
              )}
              <div className="pb-1">
                <h1 className="text-2xl font-black tracking-tight">{data.full_name}</h1>
                <p className="text-sm text-muted-foreground">
                  {data.job_role} · {data.department}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge
                    className={cn(
                      data.status === "Active"
                        ? "bg-gradient-brand text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {data.status}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {data.employee_id}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  navigate({ to: "/employees/$id/edit", params: { id: data.id } })
                }
              >
                <Pencil className="mr-1 h-4 w-4" /> Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {data.full_name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes the record. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoRow icon={Mail} label="Email" value={data.email} />
        <InfoRow icon={Phone} label="Phone" value={data.phone} />
        <InfoRow icon={Building2} label="Department" value={data.department} />
        <InfoRow icon={Briefcase} label="Job Role" value={data.job_role} />
        <InfoRow
          icon={DollarSign}
          label="Salary"
          value={`$${Number(data.salary).toLocaleString()}`}
        />
        <InfoRow
          icon={Calendar}
          label="Joining Date"
          value={new Date(data.joining_date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-4 shadow-soft">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-brand-soft text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate font-medium">{value}</div>
      </div>
    </Card>
  );
}
