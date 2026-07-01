//import { createFileRoute } from "@tanstack/react-router";
//import { AppShell, Card, Badge } from "@/components/app-shell";
//import { suppliers } from "@/lib/mock-data";
//import { Plus, Truck } from "lucide-react";

//export const Route = createFileRoute("/app/suppliers")({
//  head: () => ({ meta: [{ title: "Suppliers — StockIQ" }] }),
//  component: Suppliers,
//});

//function Suppliers() {
//  return (
//    <AppShell title="Suppliers" subtitle="Manage and compare your supplier network">
//      <Card
//        action={
//          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-elegant hover:opacity-90 transition">
//            <Plus className="h-4 w-4" /> Add supplier
//          </button>
//        }
//      >
//        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//          {suppliers.map((s) => (
//            <div
//              key={s.id}
//              className="p-5 rounded-xl border border-border bg-background hover-lift"
//            >
//              <div className="flex items-start justify-between">
//                <div className="h-11 w-11 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center">
//                  <Truck className="h-5 w-5" />
//                </div>
//                <Badge tone={s.status === "active" ? "success" : "warning"}>{s.status}</Badge>
//              </div>
//              <div className="mt-4 font-semibold">{s.name}</div>
//              <div className="text-xs text-muted-foreground">
//                {s.id} · {s.products} products
//              </div>
//              <div className="mt-4">
//                <div className="flex items-center justify-between text-xs mb-1.5">
//                  <span>Performance</span>
//                  <span className="font-medium">{s.score}/100</span>
//                </div>
//                <div className="h-2 rounded-full bg-muted overflow-hidden">
//                  <div
//                    className={`h-full transition-all ${s.score >= 85 ? "bg-success" : s.score >= 70 ? "bg-warning" : "bg-destructive"}`}
//                    style={{ width: `${s.score}%` }}
//                  />
//                </div>
//              </div>
//              <div className="mt-3 text-xs text-muted-foreground">
//                Avg delivery delay: <span className="font-medium text-foreground">{s.delay}</span>
//              </div>
//            </div>
//          ))}
//        </div>
//      </Card>
//    </AppShell>
//  );
//}

import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, Badge } from "@/components/app-shell";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { Plus, Truck, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers - StockIQ" }] }),
  component: Suppliers,
});

type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
  score: number;
  averageDelayDays: number;
  products: number;
};

type SupplierForm = {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
  score: number;
  averageDelayDays: number;
};

const emptyForm: SupplierForm = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  status: "active",
  score: 80,
  averageDelayDays: 0,
};

function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SupplierForm>(emptyForm);

  async function loadSuppliers() {
    try {
      setLoading(true);
      const data = await apiGet<Supplier[]>("/api/suppliers");
      setSuppliers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function handleAdd() {
    if (!form.name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    try {
      setSaving(true);
      await apiPost<Supplier, SupplierForm>("/api/suppliers", form);
      toast.success("Supplier added successfully");
      setForm(emptyForm);
      setShowForm(false);
      await loadSuppliers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add supplier");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this supplier?")) return;

    try {
      await apiDelete(`/api/suppliers/${id}`);
      toast.success("Supplier deleted");
      await loadSuppliers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete supplier");
    }
  }

  return (
    <AppShell title="Suppliers" subtitle="Manage and compare your supplier network">
      <Card
        action={
          <button
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-elegant hover:opacity-90 transition"
          >
            <Plus className="h-4 w-4" /> Add supplier
          </button>
        }
      >
        {showForm && (
          <div className="mb-5 rounded-xl border border-border bg-background p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Add Supplier</div>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <input
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                placeholder="Supplier name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                placeholder="Contact person"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              />
              <input
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <input
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                type="number"
                placeholder="Score"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
              />
              <input
                className="h-10 px-3 rounded-lg border bg-background text-sm"
                type="number"
                placeholder="Avg delay days"
                value={form.averageDelayDays}
                onChange={(e) => setForm({ ...form, averageDelayDays: Number(e.target.value) })}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="h-9 px-4 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save supplier"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="h-9 px-4 rounded-lg border text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading suppliers...
          </div>
        ) : suppliers.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No suppliers found.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-xl border border-border bg-background hover-lift"
              >
                <div className="flex items-start justify-between">
                  <div className="h-11 w-11 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={s.status === "active" ? "success" : "warning"}>{s.status}</Badge>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-destructive hover:bg-destructive/10 rounded-md p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground">
                  {s.contactPerson || "No contact"} · {s.products} products
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span>Performance</span>
                    <span className="font-medium">{s.score}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all ${s.score >= 85 ? "bg-success" : s.score >= 70 ? "bg-warning" : "bg-destructive"}`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Avg delivery delay:{" "}
                  <span className="font-medium text-foreground">{s.averageDelayDays} days</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{s.email}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.phone}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
