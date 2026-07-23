import { z } from "zod";

export const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Support",
] as const;

export const employeeSchema = z.object({
  employee_id: z
    .string()
    .trim()
    .min(2, "Employee ID is required")
    .max(32, "Too long"),
  full_name: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s\-()]{6,20}$/, "Enter a valid phone number"),
  department: z.string().min(1, "Select a department"),
  job_role: z.string().trim().min(2, "Job role is required").max(80),
  salary: z.coerce.number().min(0, "Salary must be positive").max(10_000_000),
  joining_date: z.string().min(1, "Joining date is required"),
  status: z.enum(["Active", "Inactive"]),
  photo_url: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .max(500)
    .optional()
    .or(z.literal("")),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export type Employee = {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  job_role: string;
  salary: number;
  joining_date: string;
  status: "Active" | "Inactive";
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};
