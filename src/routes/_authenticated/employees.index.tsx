import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity";
import { DEPARTMENTS, type Employee } from "@/lib/employee-schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export const Route = createFileRoute("/_authenticated/employees/")({
  component: EmployeesList,
});

const PAGE_SIZE = 8;

type SortKey = "full_name" | "employee_id" | "department" | "joining_date" | "salary";

function EmployeesList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("full_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const { data = [], isLoading } = useQuery({
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

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let rows = data.filter((e) => {
      if (dept !== "all" && e.department !== dept) return false;
      if (status !== "all" && e.status !== status) return false;
      if (!term) return true;
      return (
        e.full_name.toLowerCase().includes(term) ||
        e.employee_id.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term) ||
        e.department.toLowerCase().includes(term)
      );
    });
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [data, q, dept, status, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  const handleDelete = async (emp: Employee) => {
    const { error } = await supabase
      .from("employees" as never)
      .delete()
      .eq("id", emp.id);
    if (error) return toast.error(error.message);
    await logActivity("Deleted employee", `${emp.full_name} (${emp.employee_id})`);
    toast.success(`Deleted ${emp.full_name}`);
    qc.invalidateQueries({ queryKey: ["employees"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Employees</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the full employee directory.
          </p>
        </div>
        <Link
          to="/employees/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-brand transition hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" /> Add employee
        </Link>
      </div>

      <Card className="p-4 shadow-soft">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name, ID, email, or department…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={dept}
            onValueChange={(v) => {
              setDept(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-3.5 w-3.5" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <SortableTH label="Employee" onClick={() => toggleSort("full_name")} active={sortKey === "full_name"} />
                <SortableTH label="ID" onClick={() => toggleSort("employee_id")} active={sortKey === "employee_id"} />
                <SortableTH label="Department" onClick={() => toggleSort("department")} active={sortKey === "department"} />
                <TableHead>Role</TableHead>
                <SortableTH label="Salary" onClick={() => toggleSort("salary")} active={sortKey === "salary"} />
                <SortableTH label="Joined" onClick={() => toggleSort("joining_date")} active={sortKey === "joining_date"} />
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No employees match your filters.
                  </TableCell>
                </TableRow>
              )}
              {paged.map((e) => (
                <TableRow key={e.id} className="hover:bg-accent/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <MiniAvatar name={e.full_name} url={e.photo_url} />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{e.full_name}</div>
                        <div className="truncate text-xs text-muted-foreground">{e.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{e.employee_id}</TableCell>
                  <TableCell>{e.department}</TableCell>
                  <TableCell>{e.job_role}</TableCell>
                  <TableCell>
                    ${Number(e.salary).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell>{new Date(e.joining_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        e.status === "Active"
                          ? "bg-gradient-brand text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {e.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => navigate({ to: "/employees/$id", params: { id: e.id } })}
                        aria-label="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => navigate({ to: "/employees/$id/edit", params: { id: e.id } })}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" aria-label="Delete">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {e.full_name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove this employee record. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(e)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm">
          <div className="text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filtered.length)}
            </span>{" "}
            of <span className="font-medium text-foreground">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SortableTH({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <TableHead>
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        {label} <ArrowUpDown className="h-3 w-3" />
      </button>
    </TableHead>
  );
}

function MiniAvatar({ name, url }: { name: string; url: string | null }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (url)
    return (
      <img src={url} alt={name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
    );
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground">
      {initials}
    </div>
  );
}
