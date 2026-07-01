import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password - StockIQ" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const nav = useNavigate();
  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("token") || "";
  }, []);

  const [form, setForm] = useState({
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await apiPost<
        { message: string },
        {
          token: string;
          newPassword: string;
        }
      >("/api/auth/reset-password", {
        token,
        newPassword: form.password,
      });

      setDone(true);
      toast.success("Password reset successfully");
      setTimeout(() => nav({ to: "/login" }), 1200);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={done ? "Password updated" : "Set a new password"}
      subtitle={
        done
          ? "You can now log in with your new password."
          : "Choose a strong password for your StockIQ account."
      }
      footer={
        <>
          Back to{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            log in
          </Link>
        </>
      }
    >
      {done ? (
        <div className="rounded-xl border border-success/30 bg-success/5 p-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
          <p className="mt-3 text-sm">Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <PasswordField
            label="New password"
            value={form.password}
            onChange={(value) => setForm((f) => ({ ...f, password: value }))}
          />

          <PasswordField
            label="Confirm password"
            value={form.confirm}
            onChange={(value) => setForm((f) => ({ ...f, confirm: value }))}
          />

          <button
            disabled={loading}
            className="w-full h-11 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-elegant hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Reset password
          </button>
        </form>
      )}
    </AuthShell>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <div className="flex items-center gap-2 h-11 px-3 rounded-lg border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <input
          type="password"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-sm"
          placeholder="Minimum 8 characters"
        />
      </div>
    </div>
  );
}
