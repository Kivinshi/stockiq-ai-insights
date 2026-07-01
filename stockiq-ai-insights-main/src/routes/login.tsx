//import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
//import { useState, type FormEvent, type ReactNode } from "react";
//import { Mail, Lock, Eye, EyeOff, Loader2, type LucideIcon } from "lucide-react";
//import { AuthShell } from "@/components/auth-shell";
//import { setSession, dashboardPath, ROLE_META, type Role } from "@/lib/auth";
//import { toast } from "sonner";

//export const Route = createFileRoute("/login")({
//  head: () => ({
//    meta: [
//      { title: "Log in — StockIQ" },
//      { name: "description", content: "Log in to your StockIQ workspace." },
//    ],
//  }),
//  component: Login,
//});

//function Login() {
//  const nav = useNavigate();
//  const [email, setEmail] = useState("admin@stockiq.app");
//  const [password, setPassword] = useState("demo1234");
//  const [role, setRole] = useState<Role>("admin");
//  const [show, setShow] = useState(false);
//  const [loading, setLoading] = useState(false);

//  function submit(e: FormEvent) {
//    e.preventDefault();
//    setLoading(true);

//    setTimeout(() => {
//      setSession({
//        userId: `demo-${role}-${email.toLowerCase()}`,
//        token: `demo-token-${Date.now()}`,
//        name: email.split("@")[0].replace(/\./g, " "),
//        email,
//        role,
//      });

//      toast.success(`Welcome back — entering ${ROLE_META[role].label} dashboard`);
//      nav({ to: dashboardPath(role) });
//    }, 700);
//  }

//  return (
//    <AuthShell
//      title="Welcome back"
//      subtitle="Log in to your StockIQ workspace"
//      footer={
//        <>
//          Don&apos;t have an account?{" "}
//          <Link to="/register" className="text-primary font-medium hover:underline">
//            Create one
//          </Link>
//        </>
//      }
//    >
//      <form onSubmit={submit} className="space-y-4">
//        <Field label="Email" icon={Mail}>
//          <input
//            type="email"
//            required
//            value={email}
//            onChange={(e) => setEmail(e.target.value)}
//            className="w-full bg-transparent outline-none text-sm"
//            placeholder="you@company.com"
//          />
//        </Field>

//        <Field
//          label="Password"
//          icon={Lock}
//          right={
//            <button
//              type="button"
//              onClick={() => setShow(!show)}
//              className="text-muted-foreground hover:text-foreground"
//            >
//              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//            </button>
//          }
//        >
//          <input
//            type={show ? "text" : "password"}
//            required
//            value={password}
//            onChange={(e) => setPassword(e.target.value)}
//            className="w-full bg-transparent outline-none text-sm"
//            placeholder="••••••••"
//          />
//        </Field>

//        <div>
//          <label className="text-sm font-medium">Demo role</label>
//          <p className="text-xs text-muted-foreground mb-2">
//            Select a role to preview the dashboard (no backend).
//          </p>

//          <div className="grid grid-cols-4 gap-2">
//            {(["admin", "manager", "staff", "viewer"] as Role[]).map((r) => (
//              <button
//                key={r}
//                type="button"
//                onClick={() => setRole(r)}
//                className={`text-xs font-medium py-2 rounded-lg border transition ${
//                  role === r
//                    ? "bg-gradient-primary text-primary-foreground border-transparent shadow-elegant"
//                    : "border-border hover:bg-accent"
//                }`}
//              >
//                {ROLE_META[r].label}
//              </button>
//            ))}
//          </div>
//        </div>

//        <div className="flex items-center justify-between text-sm">
//          <label className="flex items-center gap-2">
//            <input type="checkbox" className="rounded" /> Remember me
//          </label>

//          <Link to="/forgot-password" className="text-primary hover:underline">
//            Forgot password?
//          </Link>
//        </div>

//        <button
//          disabled={loading}
//          className="w-full h-11 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-elegant hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
//        >
//          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Log in
//        </button>
//      </form>
//    </AuthShell>
//  );
//}

//function Field({
//  label,
//  icon: Icon,
//  right,
//  children,
//}: {
//  label: string;
//  icon: LucideIcon;
//  right?: ReactNode;
//  children: ReactNode;
//}) {
//  return (
//    <div>
//      <label className="text-sm font-medium block mb-1.5">{label}</label>

//      <div className="flex items-center gap-2 h-11 px-3 rounded-lg border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
//        <Icon className="h-4 w-4 text-muted-foreground" />
//        {children}
//        {right}
//      </div>
//    </div>
//  );
//}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, type LucideIcon } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { setSession, dashboardPath, ROLE_META, type Role } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — StockIQ" },
      { name: "description", content: "Log in to your StockIQ workspace." },
    ],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await apiPost<
        {
          token: string;
          userId: string;
          name: string;
          email: string;
          role: Role;
        },
        {
          email: string;
          password: string;
        }
      >("/api/auth/login", {
        email,
        password,
      });

      setSession(result);

      toast.success(`Welcome back — entering ${ROLE_META[result.role].label} dashboard`);
      nav({ to: dashboardPath(result.role) });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your StockIQ workspace"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" icon={Mail}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
            placeholder="you@company.com"
          />
        </Field>

        <Field
          label="Password"
          icon={Lock}
          right={
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        >
          <input
            type={show ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
            placeholder="••••••••"
          />
        </Field>

        <div className="flex items-center justify-end text-sm">
          <Link to="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          disabled={loading}
          className="w-full h-11 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-elegant hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Log in
        </button>
      </form>
    </AuthShell>
  );
}

function Field({
  label,
  icon: Icon,
  right,
  children,
}: {
  label: string;
  icon: LucideIcon;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>

      <div className="flex items-center gap-2 h-11 px-3 rounded-lg border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {children}
        {right}
      </div>
    </div>
  );
}
