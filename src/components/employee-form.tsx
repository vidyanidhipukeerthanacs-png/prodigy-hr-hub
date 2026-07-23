import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  DEPARTMENTS,
  employeeSchema,
  type EmployeeFormValues,
} from "@/lib/employee-schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

type Props = {
  initial?: Partial<EmployeeFormValues>;
  submitLabel: string;
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
};

export function EmployeeForm({ initial, submitLabel, onSubmit }: Props) {
  const [values, setValues] = useState<EmployeeFormValues>({
    employee_id: initial?.employee_id ?? "",
    full_name: initial?.full_name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    department: initial?.department ?? "",
    job_role: initial?.job_role ?? "",
    salary: initial?.salary ?? 0,
    joining_date: initial?.joining_date ?? new Date().toISOString().slice(0, 10),
    status: (initial?.status as "Active" | "Inactive") ?? "Active",
    photo_url: initial?.photo_url ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof EmployeeFormValues>(
    k: K,
    v: EmployeeFormValues[K],
  ) => setValues((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = employeeSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[String(i.path[0])] = i.message;
      });
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await onSubmit(parsed.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card className="p-6 shadow-soft">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Identity
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Employee ID" error={errors.employee_id}>
            <Input
              value={values.employee_id}
              onChange={(e) => set("employee_id", e.target.value)}
              placeholder="EMP-0001"
            />
          </Field>
          <Field label="Full Name" error={errors.full_name}>
            <Input
              value={values.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              placeholder="Ada Lovelace"
            />
          </Field>
          <Field label="Email Address" error={errors.email}>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="ada@company.com"
            />
          </Field>
          <Field label="Phone Number" error={errors.phone}>
            <Input
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+1 555 123 4567"
            />
          </Field>
        </div>
      </Card>

      <Card className="p-6 shadow-soft">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Employment
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Department" error={errors.department}>
            <Select value={values.department} onValueChange={(v) => set("department", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Job Role" error={errors.job_role}>
            <Input
              value={values.job_role}
              onChange={(e) => set("job_role", e.target.value)}
              placeholder="Senior Engineer"
            />
          </Field>
          <Field label="Salary" error={errors.salary}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={values.salary}
              onChange={(e) => set("salary", Number(e.target.value))}
            />
          </Field>
          <Field label="Joining Date" error={errors.joining_date}>
            <Input
              type="date"
              value={values.joining_date}
              onChange={(e) => set("joining_date", e.target.value)}
            />
          </Field>
          <Field label="Status" error={errors.status}>
            <Select
              value={values.status}
              onValueChange={(v) => set("status", v as "Active" | "Inactive")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Profile Photo URL (optional)" error={errors.photo_url}>
            <Input
              value={values.photo_url ?? ""}
              onChange={(e) => set("photo_url", e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-90"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
