import { createFileRoute } from "@tanstack/react-router";
import { AppShell, KpiCard, Card, Badge } from "@/components/app-shell";
import { apiGet } from "@/lib/api";
import type { DashboardData } from "@/lib/dashboard-types";
import { DollarSign, Download, Package2, Receipt, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/viewer")({
  head: () => ({ meta: [{ title: "Viewer Dashboard - StockIQ" }] }),
  component: ViewerDash,
});

function ViewerDash() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const dashboard = await apiGet<DashboardData>("/api/dashboard/viewer");
        setData(dashboard);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <AppShell title="Reports Dashboard" subtitle="Loading financial overview">
        <Card>
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading dashboard...
          </div>
        </Card>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell title="Reports Dashboard" subtitle="Read-only financial overview">
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
      title="Reports Dashboard"
      subtitle="Read-only financial overview - sales, P&L and inventory"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Monthly Sales"
          value={`₹${data.kpis.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          accent="success"
        />
        <KpiCard
          label="Today Sales"
          value={`₹${data.kpis.todaySales.toLocaleString()}`}
          icon={TrendingUp}
          accent="primary"
        />
        <KpiCard
          label="Inventory Value"
          value={`₹${data.kpis.inventoryValue.toLocaleString()}`}
          icon={Package2}
          accent="warning"
        />
        <KpiCard
          label="Invoices"
          value={data.recentOrders.length.toString()}
          hint="recent"
          icon={Receipt}
          accent="primary"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card title="Sales vs Expense">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={data.salesTrend}>
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
                <Bar dataKey="sales" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Profit">
          <div className="h-60">
            <ResponsiveContainer>
              <AreaChart data={data.salesTrend}>
                <defs>
                  <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--chart-2)"
                  strokeWidth={2.5}
                  fill="url(#profitFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card
        title="Recent Invoices"
        action={
          <button
            onClick={() => toast.success("Use Reports page for export")}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 h-8 rounded-lg border border-border hover:bg-accent transition"
          >
            <Download className="h-3 w-3" /> Export
          </button>
        }
      >
        <div className="overflow-x-auto -mx-5 -mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                {["Invoice", "Customer", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="px-5 pb-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_td]:px-5 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-border last:[&_tr]:border-0">
              {data.recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/40 transition">
                  <td className="font-medium">{o.orderNumber}</td>
                  <td>{o.customer}</td>
                  <td>₹{o.total.toLocaleString()}</td>
                  <td>
                    <Badge
                      tone={
                        o.status === "paid"
                          ? "success"
                          : o.status === "pending"
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {o.status}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground">{new Date(o.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
