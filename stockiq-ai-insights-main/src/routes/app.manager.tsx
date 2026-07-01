import { createFileRoute } from "@tanstack/react-router";
import { AppShell, KpiCard, Card, Badge, type BadgeTone } from "@/components/app-shell";
import { apiGet } from "@/lib/api";
import type { DashboardData } from "@/lib/dashboard-types";
import { AlertTriangle, Bot, DollarSign, Package2, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/manager")({
  head: () => ({ meta: [{ title: "Manager Dashboard - StockIQ" }] }),
  component: ManagerDash,
});

type AiInsight = {
  title: string;
  body: string;
  level: "primary" | "success" | "warning" | "danger";
  category: string;
};

type ReorderSuggestion = {
  productId: string;
  sku: string;
  productName: string;
  currentStock: number;
  minStock: number;
  suggestedQuantity: number;
  reason: string;
  priority: "low" | "medium" | "high";
};

function ManagerDash() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [aiInsights, setAiInsights] = useState<AiInsight[]>([]);
  const [reorderSuggestions, setReorderSuggestions] = useState<ReorderSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadManagerData() {
    try {
      setLoading(true);

      const [dashboardData, insightsData, suggestionsData] = await Promise.all([
        apiGet<DashboardData>("/api/dashboard/manager"),
        apiGet<AiInsight[]>("/api/ai/insights"),
        apiGet<ReorderSuggestion[]>("/api/ai/reorder-suggestions"),
      ]);

      setDashboard(dashboardData);
      setAiInsights(insightsData);
      setReorderSuggestions(suggestionsData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load manager dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadManagerData();
  }, []);

  if (loading) {
    return (
      <AppShell title="Manager Dashboard" subtitle="Loading business performance">
        <Card>
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading dashboard...
          </div>
        </Card>
      </AppShell>
    );
  }

  if (!dashboard) {
    return (
      <AppShell title="Manager Dashboard" subtitle="Business performance">
        <Card>
          <div className="py-12 text-center text-sm text-muted-foreground">
            Dashboard data unavailable.
          </div>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Manager Dashboard"
      subtitle="Business performance, forecasts and supplier health"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Monthly Revenue"
          value={`₹${dashboard.kpis.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          accent="success"
        />
        <KpiCard
          label="Stock Value"
          value={`₹${dashboard.kpis.inventoryValue.toLocaleString()}`}
          icon={Package2}
          accent="primary"
        />
        <KpiCard
          label="Low Stock"
          value={String(dashboard.kpis.lowStock)}
          hint="needs reorder"
          icon={AlertTriangle}
          accent="warning"
        />
        <KpiCard label="Forecast" value="Rule-based" icon={TrendingUp} accent="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card title="Sales vs AI Forecast" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={dashboard.salesTrend}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="AI Reorder Suggestions"
          action={
            <Badge tone="primary">
              <Bot className="h-3 w-3 mr-1 inline" /> AI
            </Badge>
          }
        >
          <div className="space-y-3">
            {reorderSuggestions.length === 0 ? (
              <div className="text-sm text-muted-foreground">No reorder suggestions.</div>
            ) : (
              reorderSuggestions.slice(0, 4).map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{item.productName}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.sku} · stock {item.currentStock}
                    </div>
                  </div>
                  <Badge tone={item.priority === "high" ? "destructive" : "warning"}>
                    +{item.suggestedQuantity}u
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Supplier Performance">
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={dashboard.supplierScores} layout="vertical">
                <CartesianGrid stroke="var(--border)" horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  width={120}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} fill="var(--chart-1)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="AI Business Insights">
          <div className="space-y-3">
            {aiInsights.length === 0 ? (
              <div className="text-sm text-muted-foreground">No AI insights available.</div>
            ) : (
              aiInsights.map((item, index) => {
                const tone = item.level === "danger" ? "destructive" : item.level;

                return (
                  <div key={index} className="p-3 rounded-xl border border-border bg-background/40">
                    <div className="flex items-center gap-2">
                      <Badge tone={tone as BadgeTone}>{item.level}</Badge>
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.body}</p>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
