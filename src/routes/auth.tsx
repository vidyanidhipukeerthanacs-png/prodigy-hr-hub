import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Sparkles, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Prodigy EMS" },
      {
        name: "description",
        content: "Sign in or create an admin account for Prodigy EMS.",
      },
      { property: "og:title", content: "Prodigy EMS — Admin Sign in" },
      {
        property: "og:description",
        content: "Secure admin authentication for the Employee Management System.",
      },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password too long");

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 bg-[#0b0616] text-white">
      {/* Unique animated aurora + grid background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#4c1d95_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,#1e3a8a_0%,transparent_55%),radial-gradient(circle_at_center,#7c3aed22_0%,transparent_60%)]" />
        <div
          className="absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full opacity-40 blur-3xl animate-[spin_28s_linear_infinite]"
          style={{ background: "conic-gradient(from 0deg, #8b5cf6, #3b82f6, #06b6d4, #8b5cf6)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />
        <div className="absolute top-10 left-10 h-2 w-2 rounded-full bg-white/70 animate-pulse" />
        <div className="absolute bottom-16 right-24 h-1.5 w-1.5 rounded-full bg-cyan-300/80 animate-pulse [animation-delay:600ms]" />
        <div className="absolute top-1/3 right-10 h-1 w-1 rounded-full bg-fuchsia-300/80 animate-pulse [animation-delay:1200ms]" />
      </div>


      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_20px_80px_-20px_rgba(139,92,246,0.5)] backdrop-blur-xl text-foreground">

          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-brand">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Prodigy EMS</h1>
              <p className="text-xs text-muted-foreground">Admin authentication</p>
            </div>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-5">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup" className="mt-5">
              <SignupForm onCreated={() => setTab("login")} />
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-xs text-white/60">
          Prodigy Infotech · Task 02 — Employee Management System
        </p>
      </div>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailR = emailSchema.safeParse(email);
    const pwR = passwordSchema.safeParse(password);
    if (!emailR.success) return toast.error(emailR.error.issues[0].message);
    if (!pwR.success) return toast.error(pwR.error.issues[0].message);

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: emailR.data,
      password: pwR.data,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="l-email">Email</Label>
        <Input
          id="l-email"
          type="email"
          autoComplete="email"
          placeholder="admin@prodigy.dev"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="l-pw">Password</Label>
        <div className="relative">
          <Input
            id="l-pw"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-90"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign in
      </Button>
    </form>
  );
}

function SignupForm({ onCreated }: { onCreated: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailR = emailSchema.safeParse(email);
    const pwR = passwordSchema.safeParse(password);
    if (!emailR.success) return toast.error(emailR.error.issues[0].message);
    if (!pwR.success) return toast.error(pwR.error.issues[0].message);

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: emailR.data,
      password: pwR.data,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: emailR.data,
      password: pwR.data,
    });
    setLoading(false);
    if (signInErr) {
      toast.success("Account created — please sign in.");
      onCreated();
      return;
    }
    toast.success("Welcome to Prodigy EMS!");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="s-email">Email</Label>
        <Input
          id="s-email"
          type="email"
          autoComplete="email"
          placeholder="admin@prodigy.dev"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="s-pw">Password</Label>
        <div className="relative">
          <Input
            id="s-pw"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-90"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create admin account
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        By continuing you agree to secure, admin-only access.
      </p>
    </form>
  );
}
