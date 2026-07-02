import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import type { Session } from "@/lib/auth";
import { getSession, ROLE_META, clearSession } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { LogOut, Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile - StockIQ" }] }),
  component: Profile,
});

function Profile() {
  const nav = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (!session) {
    return (
      <AppShell title="Profile">
        <Card>
          <div className="py-10 text-center text-sm text-muted-foreground">Loading profile...</div>
        </Card>
      </AppShell>
    );
  }

  const meta = ROLE_META[session.role];

  async function updatePassword() {
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      await apiPost<{ message: string }, { currentPassword: string; newPassword: string }>(
        "/api/auth/change-password",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        session.token,
      );

      toast.success("Password updated successfully");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password update failed");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <AppShell title="Profile" subtitle="Your account & preferences">
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 text-center">
          <div className="h-24 w-24 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center mx-auto text-3xl font-bold shadow-glow">
            {session.name.charAt(0).toUpperCase()}
          </div>

          <div className="mt-4 font-display text-xl font-bold capitalize">{session.name}</div>
          <div className="text-sm text-muted-foreground">{session.email}</div>

          <span
            className={`mt-3 inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${meta.color}`}
          >
            {meta.label}
          </span>

          <p className="mt-3 text-xs text-muted-foreground">{meta.description}</p>

          <button
            onClick={() => {
              clearSession();
              toast.success("Signed out");
              nav({ to: "/login" });
            }}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-border hover:bg-destructive hover:text-destructive-foreground transition text-sm font-medium"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </Card>

        <Card title="Account" className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Full name" value={session.name} />
            <Field label="Email" value={session.email} />
            <Field label="Role" value={meta.label} />
            <Field label="User ID" value={session.userId} />
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="font-medium mb-3">Change password</div>

            <div className="grid sm:grid-cols-3 gap-3">
              <PasswordInput
                label="Current"
                value={passwordForm.currentPassword}
                onChange={(value) =>
                  setPasswordForm((form) => ({ ...form, currentPassword: value }))
                }
              />

              <PasswordInput
                label="New"
                value={passwordForm.newPassword}
                onChange={(value) => setPasswordForm((form) => ({ ...form, newPassword: value }))}
              />

              <PasswordInput
                label="Confirm"
                value={passwordForm.confirmPassword}
                onChange={(value) =>
                  setPasswordForm((form) => ({ ...form, confirmPassword: value }))
                }
              />
            </div>

            <button
              onClick={updatePassword}
              disabled={passwordLoading}
              className="mt-4 inline-flex h-10 items-center gap-2 px-4 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-elegant hover:opacity-90 transition disabled:opacity-60"
            >
              {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        value={value}
        readOnly
        className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-muted/40 text-sm outline-none"
      />
    </div>
  );
}

function PasswordInput({
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
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
      />
    </div>
  );
}
