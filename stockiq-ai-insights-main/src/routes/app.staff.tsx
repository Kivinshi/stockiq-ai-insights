import { createFileRoute } from "@tanstack/react-router";
import { AppShell, KpiCard, Card, Badge } from "@/components/app-shell";
import { apiGet, apiPut } from "@/lib/api";
import type { DashboardData } from "@/lib/dashboard-types";
import {
  Check,
  ListChecks,
  Minus,
  PackageMinus,
  PackagePlus,
  Plus,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/staff")({
  head: () => ({ meta: [{ title: "Staff Dashboard - StockIQ" }] }),
  component: StaffDash,
});

type StaffTask = {
  id: string;
  title: string;
  description: string;
  due: string;
  done: boolean;
};

function StaffDash() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStaffData() {
    try {
      setLoading(true);
      const [dashboardData, taskData] = await Promise.all([
        apiGet<DashboardData>("/api/dashboard/staff"),
        apiGet<StaffTask[]>("/api/tasks/today"),
      ]);

      setDashboard(dashboardData);
      setTasks(taskData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load staff dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaffData();
  }, []);

  async function toggleTask(id: string) {
    try {
      await apiPut(`/api/tasks/${id}/toggle`, {});
      toast.success("Task updated");
      await loadStaffData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task");
    }
  }

  if (loading) {
    return (
      <AppShell title="Staff Dashboard" subtitle="Loading today's operations">
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
      <AppShell title="Staff Dashboard" subtitle="Today's operations">
        <Card>
          <div className="py-12 text-center text-sm text-muted-foreground">
            Dashboard data unavailable.
          </div>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Staff Dashboard" subtitle="Today's operations - stock movements and orders">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Today Tasks"
          value={`${tasks.filter((task) => !task.done).length}/${tasks.length}`}
          hint="pending"
          icon={ListChecks}
          accent="primary"
        />
        <KpiCard
          label="Stock In"
          value={`${dashboard.kpis.stockInToday}u`}
          icon={PackagePlus}
          accent="success"
        />
        <KpiCard
          label="Stock Out"
          value={`${dashboard.kpis.stockOutToday}u`}
          hint="dispatched"
          icon={PackageMinus}
          accent="warning"
        />
        <KpiCard
          label="Open Orders"
          value={String(dashboard.kpis.pendingOrders)}
          hint="to fulfill"
          icon={ShoppingCart}
          accent="primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card title="Sales - this week" className="lg:col-span-2">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={dashboard.salesTrend}>
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
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Today's Tasks">
          <ul className="space-y-2">
            {tasks.length === 0 ? (
              <li className="text-sm text-muted-foreground">No tasks for today.</li>
            ) : (
              tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`h-5 w-5 rounded-md border-2 grid place-items-center transition ${
                      task.done
                        ? "bg-success border-success text-success-foreground"
                        : "border-border"
                    }`}
                  >
                    {task.done && <Check className="h-3 w-3" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm ${task.done ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{task.due}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="grid sm:grid-cols-3 gap-3">
          <QA
            icon={Plus}
            label="Stock In"
            desc="Record incoming inventory"
            onClick={() => toast.info("Go to Inventory page for Stock In")}
          />
          <QA
            icon={Minus}
            label="Stock Out"
            desc="Log outbound dispatch"
            onClick={() => toast.info("Go to Inventory page for Stock Out")}
          />
          <QA
            icon={ShoppingCart}
            label="New Sales Order"
            desc="Create an order"
            onClick={() => toast.info("Go to Sales page for New Order")}
          />
        </div>
      </Card>

      <Card title="Recent Orders" className="mt-6">
        <Table head={["Order", "Customer", "Total", "Status", "Date"]}>
          {dashboard.recentOrders.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-muted-foreground py-10">
                No recent orders.
              </td>
            </tr>
          ) : (
            dashboard.recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/40 transition">
                <td className="py-3 font-medium">{order.orderNumber}</td>
                <td>{order.customer}</td>
                <td>₹{order.total.toLocaleString()}</td>
                <td>
                  <Badge
                    tone={
                      order.status === "paid"
                        ? "success"
                        : order.status === "pending"
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {order.status}
                  </Badge>
                </td>
                <td className="text-muted-foreground">
                  {new Date(order.date).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </AppShell>
  );
}

function QA({
  icon: Icon,
  label,
  desc,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-xl border border-border bg-background hover-lift transition group"
    >
      <div className="h-10 w-10 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-glow group-hover:scale-110 transition">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 font-medium">{label}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </button>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-5 -mb-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
            {head.map((h) => (
              <th key={h} className="px-5 pb-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:px-5 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-border last:[&_tr]:border-0">
          {children}
        </tbody>
      </table>
    </div>
  );
}
