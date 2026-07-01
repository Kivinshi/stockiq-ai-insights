//import { createFileRoute } from "@tanstack/react-router";
//import { AppShell, Card, KpiCard, Badge } from "@/components/app-shell";
//import { Boxes, AlertTriangle, PackagePlus, Warehouse } from "lucide-react";
//import { products, stockUsage } from "@/lib/mock-data";
//import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

//export const Route = createFileRoute("/app/inventory")({
//  head: () => ({ meta: [{ title: "Inventory — StockIQ" }] }),
//  component: Inventory,
//});

//function Inventory() {
//  const total = products.reduce((s, p) => s + p.stock, 0);
//  const value = products.reduce((s, p) => s + p.stock * p.price, 0);
//  const low = products.filter((p) => p.status !== "in").length;
//  return (
//    <AppShell title="Inventory" subtitle="Real-time stock across all branches">
//      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//        <KpiCard label="Total Units" value={total.toLocaleString()} icon={Boxes} accent="primary" />
//        <KpiCard
//          label="Inventory Value"
//          value={`₹${(value / 100000).toFixed(1)}L`}
//          icon={Warehouse}
//          accent="success"
//        />
//        <KpiCard
//          label="Low / Out"
//          value={String(low)}
//          hint="needs attention"
//          icon={AlertTriangle}
//          accent="warning"
//        />
//        <KpiCard
//          label="Movements (7d)"
//          value="1.2k"
//          trend="+8%"
//          icon={PackagePlus}
//          accent="primary"
//        />
//      </div>

//      <Card title="Stock movement — last 7 days" className="mb-6">
//        <div className="h-64">
//          <ResponsiveContainer>
//            <BarChart data={stockUsage}>
//              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
//              <XAxis
//                dataKey="d"
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
//              <Bar dataKey="in" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
//              <Bar dataKey="out" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
//            </BarChart>
//          </ResponsiveContainer>
//        </div>
//      </Card>

//      <Card title="Low stock items">
//        <div className="space-y-2">
//          {products
//            .filter((p) => p.status !== "in")
//            .map((p) => {
//              const pct = Math.min(100, Math.round((p.stock / p.min) * 100));
//              return (
//                <div key={p.id} className="p-3 rounded-xl border border-border bg-background/50">
//                  <div className="flex items-center justify-between mb-2">
//                    <div>
//                      <div className="text-sm font-medium">{p.name}</div>
//                      <div className="text-xs text-muted-foreground">
//                        {p.id} · min {p.min}
//                      </div>
//                    </div>
//                    <Badge tone={p.status === "out" ? "destructive" : "warning"}>
//                      {p.stock} units
//                    </Badge>
//                  </div>
//                  <div className="h-2 rounded-full bg-muted overflow-hidden">
//                    <div
//                      className={`h-full ${p.status === "out" ? "bg-destructive" : "bg-warning"} transition-all`}
//                      style={{ width: `${pct}%` }}
//                    />
//                  </div>
//                </div>
//              );
//            })}
//        </div>
//      </Card>
//    </AppShell>
//  );
//}

import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, KpiCard, Badge } from "@/components/app-shell";
import { apiGet, apiPost } from "@/lib/api";
import { AlertTriangle, Boxes, PackagePlus, Warehouse, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inventory")({
  head: () => ({ meta: [{ title: "Inventory - StockIQ" }] }),
  component: Inventory,
});

type Summary = {
  totalUnits: number;
  inventoryValue: number;
  lowOrOutCount: number;
  movements7d: number;
};

type LowStockProduct = {
  id: string;
  sku: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
  status: "low" | "out";
};

type Movement = {
  date: string;
  day: string;
  in: number;
  out: number;
};

type Product = {
  id: string;
  sku: string;
  name: string;
  stock: number;
};

function Inventory() {
  const [summary, setSummary] = useState<Summary>({
    totalUnits: 0,
    inventoryValue: 0,
    lowOrOutCount: 0,
    movements7d: 0,
  });
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<"stock-in" | "stock-out">("stock-in");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  async function loadInventory() {
    try {
      setLoading(true);
      const [summaryData, lowStockData, movementData, productData] = await Promise.all([
        apiGet<Summary>("/api/inventory/summary"),
        apiGet<LowStockProduct[]>("/api/inventory/low-stock"),
        apiGet<Movement[]>("/api/inventory/movements"),
        apiGet<Product[]>("/api/products"),
      ]);

      setSummary(summaryData);
      setLowStock(lowStockData);
      setMovements(movementData);
      setProducts(productData);
      if (!productId && productData.length > 0) setProductId(productData[0].id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  async function handleMoveStock() {
    if (!productId) {
      toast.error("Select a product");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }

    try {
      await apiPost(`/api/inventory/${type}`, {
        productId,
        quantity,
        note,
      });

      toast.success(type === "stock-in" ? "Stock added" : "Stock removed");
      setShowForm(false);
      setQuantity(1);
      setNote("");
      await loadInventory();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Stock update failed");
    }
  }

  return (
    <AppShell title="Inventory" subtitle="Real-time stock across all branches">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Units"
          value={summary.totalUnits.toLocaleString()}
          icon={Boxes}
          accent="primary"
        />
        <KpiCard
          label="Inventory Value"
          value={`₹${(summary.inventoryValue / 100000).toFixed(1)}L`}
          icon={Warehouse}
          accent="success"
        />
        <KpiCard
          label="Low / Out"
          value={String(summary.lowOrOutCount)}
          hint="needs attention"
          icon={AlertTriangle}
          accent="warning"
        />
        <KpiCard
          label="Movements (7d)"
          value={summary.movements7d.toLocaleString()}
          icon={PackagePlus}
          accent="primary"
        />
      </div>

      <Card
        title="Stock movement - last 7 days"
        className="mb-6"
        action={
          <button
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-elegant hover:opacity-90 transition"
          >
            <PackagePlus className="h-4 w-4" /> Stock in/out
          </button>
        }
      >
        {showForm && (
          <div className="mb-5 rounded-xl border border-border bg-background p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Stock Movement</div>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-4 gap-3">
              <select
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as "stock-in" | "stock-out")}
              >
                <option value="stock-in">Stock In</option>
                <option value="stock-out">Stock Out</option>
              </select>
              <select
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.stock})
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
              <input
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                placeholder="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <button
                onClick={handleMoveStock}
                className="h-9 px-4 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium"
              >
                Save movement
              </button>
            </div>
          </div>
        )}

        <div className="h-64">
          {loading ? (
            <div className="h-full grid place-items-center text-sm text-muted-foreground">
              Loading inventory...
            </div>
          ) : (
            <ResponsiveContainer>
              <BarChart data={movements}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
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
                <Bar dataKey="in" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="out" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card title="Low stock items">
        <div className="space-y-2">
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading low stock...
            </div>
          ) : lowStock.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No low stock items.
            </div>
          ) : (
            lowStock.map((p) => {
              const pct =
                p.minStock > 0 ? Math.min(100, Math.round((p.stock / p.minStock) * 100)) : 0;
              return (
                <div key={p.id} className="p-3 rounded-xl border border-border bg-background/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.sku} · min {p.minStock}
                      </div>
                    </div>
                    <Badge tone={p.status === "out" ? "destructive" : "warning"}>
                      {p.stock} units
                    </Badge>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${p.status === "out" ? "bg-destructive" : "bg-warning"} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </AppShell>
  );
}
