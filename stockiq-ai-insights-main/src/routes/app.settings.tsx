import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — StockIQ" }] }),
  component: Settings,
});

function Settings() {
  const { theme, setTheme } = useTheme();
  return (
    <AppShell title="Settings" subtitle="Workspace preferences and configuration">
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Company profile">
          <div className="space-y-3">
            <Field label="Company name" value="Acme Pvt Ltd" />
            <Field label="GSTIN" value="27ABCDE1234F1Z5" />
            <Field label="Currency" value="INR (₹)" />
            <Field label="Timezone" value="Asia/Kolkata" />
          </div>
        </Card>
        <Card title="Appearance">
          <div className="text-sm font-medium mb-2">Theme</div>
          <div className="grid grid-cols-2 gap-3">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  toast.success(`Theme set to ${t}`);
                }}
                className={`p-4 rounded-xl border-2 transition ${theme === t ? "border-primary shadow-elegant" : "border-border hover:bg-accent"}`}
              >
                <div
                  className={`h-16 rounded-lg ${t === "light" ? "bg-white border border-border" : "bg-foreground"}`}
                />
                <div className="mt-2 text-sm font-medium capitalize">{t}</div>
              </button>
            ))}
          </div>
        </Card>
        <Card title="AI configuration">
          <Toggle label="Demand forecasting" desc="Predict future sales & stock needs" defaultOn />
          <Toggle label="Smart reorder suggestions" desc="Auto-suggest PO quantities" defaultOn />
          <Toggle label="Anomaly detection" desc="Flag unusual stock movements" />
        </Card>
        <Card title="Notifications">
          <Toggle label="Email alerts" desc="Daily summary at 9 AM" defaultOn />
          <Toggle label="SMS — critical only" desc="Out-of-stock & failures" />
          <Toggle label="In-app push" desc="Real-time push notifications" defaultOn />
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
        defaultValue={value}
        className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
      />
    </div>
  );
}

function Toggle({
  label,
  desc,
  defaultOn = false,
}: {
  label: string;
  desc: string;
  defaultOn?: boolean;
}) {
  return (
    <label className="flex items-center justify-between py-3 border-b border-border last:border-0 cursor-pointer">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
      <span
        className="relative h-6 w-11 rounded-full bg-muted peer-checked:bg-gradient-primary transition shrink-0 ml-3
        before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-background before:shadow before:transition
        peer-checked:before:translate-x-5"
      />
    </label>
  );
}
