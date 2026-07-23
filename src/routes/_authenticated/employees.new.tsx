import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity";
import { EmployeeForm } from "@/components/employee-form";

export const Route = createFileRoute("/_authenticated/employees/new")({
  component: NewEmployee,
});

function NewEmployee() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          to="/employees"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to employees
        </Link>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Add Employee</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new employee record. All fields are validated.
        </p>
      </div>

      <EmployeeForm
        submitLabel="Create employee"
        onSubmit={async (values) => {
          const { data: user } = await supabase.auth.getUser();
          const payload = {
            ...values,
            photo_url: values.photo_url ? values.photo_url : null,
            created_by: user.user?.id ?? null,
          };
          const { data, error } = await supabase
            .from("employees" as never)
            .insert(payload as never)
            .select()
            .single();
          if (error) {
            toast.error(error.message);
            return;
          }
          await logActivity(
            "Added employee",
            `${values.full_name} (${values.employee_id})`,
          );
          toast.success("Employee added");
          qc.invalidateQueries({ queryKey: ["employees"] });
          qc.invalidateQueries({ queryKey: ["activities"] });
          navigate({
            to: "/employees/$id",
            params: { id: (data as { id: string }).id },
          });
        }}
      />
    </div>
  );
}
