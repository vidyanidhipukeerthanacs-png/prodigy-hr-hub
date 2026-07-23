import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Users, BarChart3, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prodigy EMS — Modern Employee Management System" },
      {
        name: "description",
        content:
          "Welcome to the Prodigy Infotech Employee Management System. Sign in as an admin to manage employees, departments, roles, and activities.",
      },
      { property: "og:title", content: "Prodigy EMS — Welcome" },
      {
        property: "og:description",
        content: "Secure admin dashboard for managing your workforce.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full bg-gradient-brand opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[520px] w-[520px] rounded-full bg-gradient-brand-soft opacity-70 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand text-primary-foreground shadow-brand">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-black tracking-tight">Prodigy EMS</span>
        </div>
        <Link
          to="/auth"
          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-accent"
        >
          Admin Login <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-10 pb-24">
        <section className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Prodigy Infotech · Task 02
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
              Welcome to the{" "}
              <span className="text-gradient-brand">Employee Management System</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A modern, secure admin console for managing employees, departments,
              and activities. Beautiful, fast, and fully responsive — built for
              real-world teams.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-brand transition hover:translate-y-[-1px] hover:shadow-lg"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-accent"
              >
                Create admin account
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 text-sm">
              {[
                { k: "CRUD", v: "Complete" },
                { k: "Secure", v: "Auth + RLS" },
                { k: "Responsive", v: "All devices" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-muted-foreground">{s.k}</dt>
                  <dd className="mt-1 text-lg font-bold text-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: Users,
                title: "Employees, organized",
                body: "Search, filter, sort, and paginate every record with a beautiful table.",
              },
              {
                icon: BarChart3,
                title: "Insightful dashboard",
                body: "Track total headcount, active vs inactive, and department distribution.",
              },
              {
                icon: ShieldCheck,
                title: "Admin-only access",
                body: "Every route protected by authentication and row-level security.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border bg-card/80 p-5 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-brand"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-brand">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t bg-background/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Prodigy Infotech · Task 02</p>
          <p>Employee Management System</p>
        </div>
      </footer>
    </div>
  );
}
