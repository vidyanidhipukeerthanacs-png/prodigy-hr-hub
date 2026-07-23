import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity";
import type { Employee } from "@/lib/employee-schema";
import { EmployeeForm } from "@/components/employee-form";

export const Route = createFileRoute("/_authenticated/employees/$id/edit")({
  component: EditEmployee,
});

function EditEmployee() {
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          to="/employees/$id"
          params={{ id }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to profile
        </Link>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Edit Employee</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update details for {data.full_name}.
        </p>
      </div>

      <EmployeeForm
        submitLabel="Save changes"
        initial={{
          ...data,
          salary: Number(data.salary),
          joining_date: data.joining_date.slice(0, 10),
          photo_url: data.photo_url ?? "",
        }}
        onSubmit={async (values) => {
          const payload = {
            ...values,
            photo_url: values.photo_url ? values.photo_url : null,
          };
          const { error } = await supabase
            .from("employees" as never)
            .update(payload as never)
            .eq("id", id);
          if (error) return toast.error(error.message);
          await logActivity(
            "Updated employee",
            `${values.full_name} (${values.employee_id})`,
          );
          toast.success("Employee updated");
          qc.invalidateQueries({ queryKey: ["employees"] });
          qc.invalidateQueries({ queryKey: ["employee", id] });
          qc.invalidateQueries({ queryKey: ["activities"] });
          navigate({ to: "/employees/$id", params: { id } });
        }}
      />
    </div>
  );
}
