import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, KpiCard } from "@/components/app-shell";
import { apiGet } from "@/lib/api";
import { Download, FileBarChart2, FileSpreadsheet, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports")({
  head: () => ({ meta: [{ title: "Reports - StockIQ" }] }),
  component: Reports,
});

type ReportKpis = {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  gstCollected: number;
  inventoryValue: number;
};

type SalesSummaryRow = {
  date: string;
  label: string;
  orders: number;
  sales: number;
};

const REPORTS = [
  {
    type: "sales-summary",
    name: "Sales Summary",
    desc: "Detailed sales breakdown by day, product and branch",
    icon: FileBarChart2,
  },
  { type: "profit-loss", name: "Profit & Loss", desc: "Quarterly P&L statement", icon: FileText },
  { type: "gst", name: "GST Report", desc: "Tax filing-ready GST summary", icon: FileSpreadsheet },
  {
    type: "inventory-valuation",
    name: "Inventory Valuation",
    desc: "Stock-on-hand x price across branches",
    icon: FileSpreadsheet,
  },
];

function Reports() {
  const [kpis, setKpis] = useState<ReportKpis>({
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    gstCollected: 0,
    inventoryValue: 0,
  });
  const [salesTrend, setSalesTrend] = useState<SalesSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadReports() {
    try {
      setLoading(true);
      const [kpiData, salesData] = await Promise.all([
        apiGet<ReportKpis>("/api/reports/kpis"),
        apiGet<SalesSummaryRow[]>("/api/reports/sales-summary"),
      ]);
      setKpis(kpiData);
      setSalesTrend(salesData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  function exportReport(type: string) {
    const baseUrl = import.meta.env.VITE_API_URL;
    const session = localStorage.getItem("stockiq-session");
    const token = session ? JSON.parse(session).token : "";

    fetch(`${baseUrl}/api/reports/${type}/export?format=xlsx`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Export failed");
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Report exported");
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Export failed"));
  }

  return (
    <AppShell title="Reports" subtitle="Generate, export and analyze business reports">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label="Total Revenue"
          value={`₹${kpis.totalRevenue.toLocaleString()}`}
          icon={FileBarChart2}
          accent="success"
        />
        <KpiCard
          label="Total Expense"
          value={`₹${kpis.totalExpense.toLocaleString()}`}
          hint="estimated"
          icon={FileText}
          accent="warning"
        />
        <KpiCard
          label="Net Profit"
          value={`₹${kpis.netProfit.toLocaleString()}`}
          icon={FileSpreadsheet}
          accent="primary"
        />
      </div>

      <Card title="Revenue trend" className="mb-6">
        <div className="h-60">
          {loading ? (
            <div className="h-full grid place-items-center text-sm text-muted-foreground">
              Loading reports...
            </div>
          ) : (
            <ResponsiveContainer>
              <LineChart data={salesTrend}>
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
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card title="Available reports">
        <div className="grid sm:grid-cols-2 gap-3">
          {REPORTS.map((r) => (
            <div
              key={r.type}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover-lift"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center">
                <r.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground truncate">{r.desc}</div>
              </div>
              <button
                onClick={() => exportReport(r.type)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border hover:bg-accent text-sm transition"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
