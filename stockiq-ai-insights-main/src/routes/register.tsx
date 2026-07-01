import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  Briefcase,
  Loader2,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { type Role } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — StockIQ" },
      { name: "description", content: "Create your StockIQ workspace." },
    ],
  }),
  component: Register,
});

function Register() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    business: "",
    btype: "Retail",
    role: "manager" as Role,
  });

  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const strength = Math.min(
    4,
    [
      form.password.length >= 8,
      /[A-Z]/.test(form.password),
      /[0-9]/.test(form.password),
      /[^A-Za-z0-9]/.test(form.password),
    ].filter(Boolean).length,
  );

  // ✅ FINAL SUBMIT FUNCTION (API CONNECTED)
  async function submit(e: FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      await apiPost<
        { message: string },
        {
          name: string;
          email: string;
          password: string;
          phone: string;
          businessName: string;
          businessType: string;
          role: Role;
        }
      >("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        businessName: form.business,
        businessType: form.btype,
        role: form.role,
      });

      toast.success("Registration successful. Please login.");
      nav({ to: "/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Get started with StockIQ in under a minute"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Full name" icon={User}>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
              placeholder="Jane Doe"
            />
          </Field>

          <Field label="Email" icon={Mail}>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
              placeholder="jane@company.com"
            />
          </Field>

          <Field label="Mobile" icon={Phone}>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
              placeholder="+91 98765 43210"
            />
          </Field>

          <Field label="Business name" icon={Building2}>
            <input
              value={form.business}
              onChange={(e) => update("business", e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
              placeholder="Acme Pvt Ltd"
            />
          </Field>

          <Field label="Password" icon={Lock}>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
              placeholder="••••••••"
            />
          </Field>

          <Field label="Confirm password" icon={Lock}>
            <input
              type="password"
              required
              value={form.confirm}
              onChange={(e) => update("confirm", e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
              placeholder="••••••••"
            />
          </Field>
        </div>

        {form.password && (
          <div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition ${
                    i < strength
                      ? strength <= 1
                        ? "bg-destructive"
                        : strength <= 2
                          ? "bg-warning"
                          : strength <= 3
                            ? "bg-primary"
                            : "bg-success"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Use 8+ chars with a number & symbol
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium block mb-1.5">Business type</label>
            <div className="h-11 px-3 rounded-lg border border-input bg-background flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <select
                value={form.btype}
                onChange={(e) => update("btype", e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
              >
                <option>Retail</option>
                <option>Warehouse</option>
                <option>Distributor</option>
                <option>Manufacturer</option>
                <option>D2C</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">
              Role <span className="text-xs text-muted-foreground">(Admin assigned by org)</span>
            </label>
            <div className="h-11 px-3 rounded-lg border border-input bg-background flex items-center gap-2">
              <select
                value={form.role}
                onChange={(e) => update("role", e.target.value as Role)}
                className="w-full bg-transparent outline-none text-sm"
              >
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
          By creating an account you agree to our Terms and Privacy Policy.
        </div>

        <button
          disabled={loading}
          className="w-full h-11 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-elegant hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>
    </AuthShell>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <div className="flex items-center gap-2 h-11 px-3 rounded-lg border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}
