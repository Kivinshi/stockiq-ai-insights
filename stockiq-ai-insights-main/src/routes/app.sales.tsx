//import { createFileRoute } from "@tanstack/react-router";
//import { AppShell, Card, KpiCard, Badge } from "@/components/app-shell";
//import { ShoppingCart, DollarSign, Clock, Plus } from "lucide-react";
//import { orders, salesTrend } from "@/lib/mock-data";
//import {
//  AreaChart,
//  Area,
//  ResponsiveContainer,
//  Tooltip,
//  XAxis,
//  YAxis,
//  CartesianGrid,
//} from "recharts";
//import { toast } from "sonner";

//export const Route = createFileRoute("/app/sales")({
//  head: () => ({ meta: [{ title: "Sales — StockIQ" }] }),
//  component: Sales,
//});

//function Sales() {
//  const paid = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.total, 0);
//  const pending = orders.filter((o) => o.status === "pending").length;
//  return (
//    <AppShell title="Sales Orders" subtitle="Track orders, invoices and revenue">
//      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//        <KpiCard
//          label="Orders Today"
//          value={String(orders.length)}
//          icon={ShoppingCart}
//          accent="primary"
//        />
//        <KpiCard
//          label="Revenue (paid)"
//          value={`₹${paid.toLocaleString()}`}
//          trend="+12%"
//          icon={DollarSign}
//          accent="success"
//        />
//        <KpiCard
//          label="Pending"
//          value={String(pending)}
//          hint="awaiting payment"
//          icon={Clock}
//          accent="warning"
//        />
//      </div>

//      <Card title="Revenue trend" className="mb-6">
//        <div className="h-60">
//          <ResponsiveContainer>
//            <AreaChart data={salesTrend}>
//              <defs>
//                <linearGradient id="salesG" x1="0" y1="0" x2="0" y2="1">
//                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
//                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
//                </linearGradient>
//              </defs>
//              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
//              <XAxis
//                dataKey="m"
//                stroke="var(--muted-foreground)"
//                fontSize={12}
//                tickLine={false}
//                axisLine={false}
//              />
//              <YAxis
//                stroke="var(--muted-foreground)"
//                fontSize={12}
//                tickLine={false}
//                axisLine={false}
//              />
//              <Tooltip
//                contentStyle={{
//                  background: "var(--popover)",
//                  border: "1px solid var(--border)",
//                  borderRadius: 12,
//                }}
//              />
//              <Area
//                type="monotone"
//                dataKey="sales"
//                stroke="var(--chart-1)"
//                strokeWidth={2.5}
//                fill="url(#salesG)"
//              />
//            </AreaChart>
//          </ResponsiveContainer>
//        </div>
//      </Card>

//      <Card
//        title="Recent orders"
//        action={
//          <button
//            onClick={() => toast.success("New order form opened")}
//            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-elegant hover:opacity-90 transition"
//          >
//            <Plus className="h-4 w-4" /> New order
//          </button>
//        }
//      >
//        <div className="overflow-x-auto -mx-5 -mb-5">
//          <table className="w-full text-sm">
//            <thead>
//              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
//                {["Order", "Customer", "Total", "Status", "Date"].map((h) => (
//                  <th key={h} className="px-5 pb-2 font-medium">
//                    {h}
//                  </th>
//                ))}
//              </tr>
//            </thead>
//            <tbody className="[&_td]:px-5 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-border last:[&_tr]:border-0">
//              {orders.map((o) => (
//                <tr key={o.id} className="hover:bg-muted/40 transition">
//                  <td className="font-medium">{o.id}</td>
//                  <td>{o.customer}</td>
//                  <td>₹{o.total.toLocaleString()}</td>
//                  <td>
//                    <Badge
//                      tone={
//                        o.status === "paid"
//                          ? "success"
//                          : o.status === "pending"
//                            ? "warning"
//                            : "destructive"
//                      }
//                    >
//                      {o.status}
//                    </Badge>
//                  </td>
//                  <td className="text-muted-foreground">{o.date}</td>
//                </tr>
//              ))}
//            </tbody>
//          </table>
//        </div>
//      </Card>
//    </AppShell>
//  );
//}

import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Badge, Card, KpiCard } from "@/components/app-shell";
import { apiGet, apiPost } from "@/lib/api";
import { Clock, DollarSign, Plus, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/app/sales")({
  head: () => ({ meta: [{ title: "Sales - StockIQ" }] }),
  component: Sales,
});

type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: "paid" | "pending" | "cancelled";
  date: string;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
};

type SalesTrend = {
  date: string;
  label: string;
  sales: number;
};

function Sales() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [trend, setTrend] = useState<SalesTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"paid" | "pending">("paid");

  async function loadSales() {
    try {
      setLoading(true);
      const [orderData, productData, trendData] = await Promise.all([
        apiGet<Order[]>("/api/orders"),
        apiGet<Product[]>("/api/products"),
        apiGet<SalesTrend[]>("/api/sales/trend"),
      ]);
      setOrders(orderData);
      setProducts(productData);
      setTrend(trendData);
      if (!productId && productData.length > 0) setProductId(productData[0].id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load sales");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSales();
  }, []);

  const paid = useMemo(
    () => orders.filter((o) => o.status === "paid").reduce((sum, order) => sum + order.total, 0),
    [orders],
  );
  const pending = orders.filter((o) => o.status === "pending").length;

  async function handleCreateOrder() {
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (!productId) {
      toast.error("Select a product");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }

    try {
      await apiPost("/api/orders", {
        customer: {
          name: customerName,
          phone: customerPhone,
          email: "",
          address: "",
        },
        status,
        items: [{ productId, quantity }],
      });

      toast.success("Order created");
      setShowForm(false);
      setCustomerName("");
      setCustomerPhone("");
      setQuantity(1);
      await loadSales();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create order");
    }
  }

  return (
    <AppShell title="Sales Orders" subtitle="Track orders, invoices and revenue">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label="Orders"
          value={String(orders.length)}
          icon={ShoppingCart}
          accent="primary"
        />
        <KpiCard
          label="Revenue (paid)"
          value={`₹${paid.toLocaleString()}`}
          icon={DollarSign}
          accent="success"
        />
        <KpiCard
          label="Pending"
          value={String(pending)}
          hint="awaiting payment"
          icon={Clock}
          accent="warning"
        />
      </div>

      <Card title="Revenue trend" className="mb-6">
        <div className="h-60">
          {loading ? (
            <div className="h-full grid place-items-center text-sm text-muted-foreground">
              Loading sales...
            </div>
          ) : (
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="salesG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
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
                  dataKey="sales"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#salesG)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card
        title="Recent orders"
        action={
          <button
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-elegant hover:opacity-90 transition"
          >
            <Plus className="h-4 w-4" /> New order
          </button>
        }
      >
        {showForm && (
          <div className="mb-5 rounded-xl border border-border bg-background p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">New Order</div>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-5 gap-3">
              <input
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                placeholder="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <input
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                placeholder="Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
              <select
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.stock})
                  </option>
                ))}
              </select>
              <input
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <select
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as "paid" | "pending")}
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="mt-4">
              <button
                onClick={handleCreateOrder}
                className="h-9 px-4 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium"
              >
                Save order
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto -mx-5 -mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                {["Order", "Customer", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="px-5 pb-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_td]:px-5 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-border last:[&_tr]:border-0">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted-foreground py-10">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted-foreground py-10">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/40 transition">
                    <td className="font-medium">{order.orderNumber}</td>
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
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
