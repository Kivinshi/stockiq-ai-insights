import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, Badge } from "@/components/app-shell";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import {
  Search,
  Plus,
  Download,
  ChevronDown,
  ChevronUp,
  Package,
  Tag,
  Layers,
  BarChart2,
  AlertTriangle,
  IndianRupee,
  Activity,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/products")({
  head: () => ({ meta: [{ title: "Products - StockIQ" }] }),
  component: Products,
});

type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  status?: "in" | "low" | "out";
};

type ProductForm = {
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
};

const emptyForm: ProductForm = {
  sku: "",
  name: "",
  category: "",
  stock: 0,
  minStock: 0,
  price: 0,
};

function statusOf(p: Product): "in" | "low" | "out" {
  if (p.status) return p.status;
  if (p.stock <= 0) return "out";
  if (p.stock <= p.minStock) return "low";
  return "in";
}

type FieldConfig = {
  key: keyof ProductForm;
  label: string;
  placeholder: string;
  type: string;
  icon: LucideIcon;
  hint?: string;
};

const FIELDS: FieldConfig[] = [
  {
    key: "sku",
    label: "SKU",
    placeholder: "e.g. PRD-001",
    type: "text",
    icon: Tag,
    hint: "Unique stock-keeping unit code",
  },
  {
    key: "name",
    label: "Product",
    placeholder: "e.g. USB-C Hub 7-Port",
    type: "text",
    icon: Package,
    hint: "Full product display name",
  },
  {
    key: "category",
    label: "Category",
    placeholder: "e.g. Electronics",
    type: "text",
    icon: Layers,
    hint: "Product group or department",
  },
  {
    key: "stock",
    label: "Stock",
    placeholder: "0",
    type: "number",
    icon: BarChart2,
    hint: "Current units on hand",
  },
  {
    key: "minStock",
    label: "Min",
    placeholder: "0",
    type: "number",
    icon: AlertTriangle,
    hint: "Reorder trigger level",
  },
  {
    key: "price",
    label: "Price",
    placeholder: "0",
    type: "number",
    icon: IndianRupee,
    hint: "Selling price in ₹",
  },
];

type DetailField = {
  label: string;
  icon: LucideIcon;
  value: string | number;
};

function AddProductPanel({
  onSave,
  onCancel,
  saving,
}: {
  onSave: (form: ProductForm) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ProductForm>(emptyForm);

  function handleSubmit() {
    onSave(form);
  }

  return (
    <div className="mb-5 rounded-2xl border border-primary/20 bg-accent/30 shadow-elegant overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-primary/15 bg-gradient-to-r from-primary/8 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-primary grid place-items-center shadow-elegant">
            <Plus className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold">Add New Product</div>
            <div className="text-xs text-muted-foreground">
              Fill in the details below — all fields except Category are required
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="h-7 w-7 grid place-items-center rounded-lg hover:bg-accent transition text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Fields grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FIELDS.map(({ key, label, placeholder, type, icon: Icon, hint }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
              <Icon className="h-3.5 w-3.5 text-primary/70" />
              {label}
            </label>
            <input
              type={type}
              placeholder={placeholder}
              value={form[key] as string | number}
              onChange={(e) =>
                setForm({
                  ...form,
                  [key]: type === "number" ? Number(e.target.value) : e.target.value,
                })
              }
              className="h-9 px-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
            />
            {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="px-5 pb-4 flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-elegant hover:opacity-90 disabled:opacity-60 transition"
        >
          {saving ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Save product
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          className="h-9 px-4 rounded-lg border border-border hover:bg-accent text-sm transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ProductRow({ p, onDelete }: { p: Product; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const status = statusOf(p);

  const detailFields: DetailField[] = [
    { label: "SKU", icon: Tag, value: p.sku },
    { label: "Product", icon: Package, value: p.name },
    { label: "Category", icon: Layers, value: p.category || "—" },
    { label: "Stock", icon: BarChart2, value: p.stock.toLocaleString() },
    { label: "Min stock", icon: AlertTriangle, value: p.minStock },
    { label: "Price", icon: IndianRupee, value: `₹${p.price.toLocaleString()}` },
  ];

  return (
    <>
      {/* Clickable summary row */}
      <tr
        onClick={() => setOpen((s) => !s)}
        className="hover:bg-muted/40 transition cursor-pointer group select-none"
      >
        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
        <td className="px-5 py-3 font-medium">{p.name}</td>
        <td className="px-5 py-3 text-muted-foreground">{p.category || "—"}</td>
        <td className="px-5 py-3">{p.stock.toLocaleString()}</td>
        <td className="px-5 py-3 text-muted-foreground">{p.minStock}</td>
        <td className="px-5 py-3">₹{p.price.toLocaleString()}</td>
        <td className="px-5 py-3">
          <Badge tone={status === "in" ? "success" : status === "low" ? "warning" : "destructive"}>
            {status === "in" ? "In stock" : status === "low" ? "Low stock" : "Out of stock"}
          </Badge>
        </td>
        <td className="px-5 py-3">
          <span className="text-muted-foreground group-hover:text-foreground transition">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </td>
      </tr>

      {/* Expanded detail panel */}
      {open && (
        <tr>
          <td colSpan={8} className="px-0 py-0">
            <div className="mx-4 mb-3 rounded-xl border border-border bg-muted/30 overflow-hidden">
              {/* Detail header */}
              <div className="px-5 py-3 border-b border-border bg-background/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-primary/10 grid place-items-center">
                    <Package className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {p.sku}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(p.id);
                  }}
                  className="text-xs text-destructive hover:underline px-2 py-1 rounded hover:bg-destructive/10 transition"
                >
                  Delete product
                </button>
              </div>

              {/* Detail fields — read-only summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-border">
                {detailFields.map(({ label, icon: Icon, value }) => (
                  <div key={label} className="flex flex-col gap-1 px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      <Icon className="h-3 w-3" />
                      {label}
                    </div>
                    <div className="text-sm font-semibold">{value}</div>
                  </div>
                ))}
              </div>

              {/* Status bar */}
              <div className="px-5 py-2.5 border-t border-border bg-background/40 flex items-center gap-3">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Status:</span>
                <Badge
                  tone={status === "in" ? "success" : status === "low" ? "warning" : "destructive"}
                >
                  {status === "in"
                    ? "In stock"
                    : status === "low"
                      ? "Low stock — consider reordering"
                      : "Out of stock — reorder immediately"}
                </Badge>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [showForm, setShowForm] = useState(false);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await apiGet<Product[]>("/api/products");
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const cats = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const list = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "All" || p.category === cat) &&
          (p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.sku.toLowerCase().includes(q.toLowerCase())),
      ),
    [products, q, cat],
  );

  async function handleAdd(form: ProductForm) {
    if (!form.sku.trim() || !form.name.trim()) {
      toast.error("SKU and product name are required");
      return;
    }
    try {
      setSaving(true);
      await apiPost<Product, ProductForm>("/api/products", form);
      setShowForm(false);
      toast.success("Product added successfully");
      await loadProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add product");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This action cannot be undone.")) return;
    try {
      await apiDelete(`/api/products/${id}`);
      toast.success("Product deleted");
      await loadProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product");
    }
  }

  function handleExport() {
    const headers = ["SKU", "Product", "Category", "Stock", "Min Stock", "Price (₹)", "Status"];
    const rows = list.map((p) => {
      const s = statusOf(p);
      const statusLabel = s === "in" ? "In stock" : s === "low" ? "Low stock" : "Out of stock";
      return [p.sku, `"${p.name}"`, `"${p.category}"`, p.stock, p.minStock, p.price, statusLabel];
    });
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${list.length} product${list.length !== 1 ? "s" : ""}`);
  }

  const outCount = list.filter((p) => statusOf(p) === "out").length;
  const lowCount = list.filter((p) => statusOf(p) === "low").length;

  return (
    <AppShell title="Products" subtitle="Manage your master product catalog">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card shadow-card text-sm">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="font-medium">{list.length}</span>
          <span className="text-muted-foreground">total</span>
        </div>
        {lowCount > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-warning/30 bg-warning/10 text-sm">
            <AlertTriangle className="h-3.5 w-3.5 text-warning-foreground" />
            <span className="font-medium text-warning-foreground">{lowCount}</span>
            <span className="text-warning-foreground/70">low stock</span>
          </div>
        )}
        {outCount > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-destructive/30 bg-destructive/10 text-sm">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            <span className="font-medium text-destructive">{outCount}</span>
            <span className="text-destructive/70">out of stock</span>
          </div>
        )}
      </div>

      <Card>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-input bg-background flex-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by product name or SKU…"
              className="w-full bg-transparent outline-none text-sm"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          >
            {cats.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {/* Export */}
          <button
            onClick={handleExport}
            title={`Download ${list.length} products as CSV`}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-border hover:bg-accent text-sm transition"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
            {list.length > 0 && (
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                {list.length}
              </span>
            )}
          </button>

          {/* Add product */}
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-elegant hover:opacity-90 transition"
          >
            <Plus className="h-4 w-4" />
            Add product
          </button>
        </div>

        {/* Add product panel */}
        {showForm && (
          <AddProductPanel onSave={handleAdd} onCancel={() => setShowForm(false)} saving={saving} />
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto -mx-5 -mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                {["SKU", "Product", "Category", "Stock", "Min", "Price", "Status", ""].map((h) => (
                  <th key={h} className="px-5 pb-3 pt-1 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr]:border-b [&_tr]:border-border last:[&_tr]:border-0">
              {loading && (
                <tr>
                  <td colSpan={8} className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      <span className="text-sm">Loading products…</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && list.map((p) => <ProductRow key={p.id} p={p} onDelete={handleDelete} />)}

              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-14">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="h-12 w-12 rounded-2xl bg-muted grid place-items-center">
                        <Package className="h-6 w-6" />
                      </div>
                      <div className="text-sm font-medium">No products found</div>
                      <div className="text-xs">
                        {q || cat !== "All"
                          ? "Try adjusting your search or filter"
                          : "Add your first product using the button above"}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
