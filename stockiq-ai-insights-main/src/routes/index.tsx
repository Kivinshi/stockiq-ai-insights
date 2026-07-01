import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Bot,
  ShieldCheck,
  Bell,
  Users2,
  Sparkles,
  CheckCircle2,
  XCircle,
  LineChart,
  Layers,
  Moon,
  Sun,
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
  Crown,
  Briefcase,
  Wrench,
  Eye,
  Zap,
  TrendingUp,
  Database,
} from "lucide-react";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StockIQ — AI-Powered Inventory & Business Management" },
      {
        name: "description",
        content:
          "Manage stock, sales, suppliers and forecasts with AI insights. Role-based dashboards for Admin, Manager, Staff and Viewer.",
      },
      { property: "og:title", content: "StockIQ — AI Inventory Intelligence" },
      {
        property: "og:description",
        content: "Smart inventory and business management powered by AI.",
      },
    ],
  }),
  component: Landing,
});

function Nav() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const links = [
    { to: "#features", label: "Features" },
    { to: "#roles", label: "Roles" },
    { to: "#ai", label: "AI" },
    { to: "#how", label: "How it works" },
  ];
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-primary shadow-glow">
            <Boxes className="h-5 w-5 text-primary-foreground" />
          </span>
          Stock<span className="text-gradient">IQ</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {links.map((l) => (
            <a key={l.to} href={l.to} className="hover:text-foreground transition">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-accent transition"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/login"
            className="hidden sm:inline-flex h-9 items-center px-4 text-sm font-medium hover:text-primary transition"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="inline-flex h-9 items-center px-4 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-elegant hover:opacity-90 transition"
          >
            Get started
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-accent"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="px-6 py-4 flex flex-col gap-3 text-sm">
            {links.map((l) => (
              <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="py-1">
                {l.label}
              </a>
            ))}
            <Link to="/login" className="py-1">
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div
        className="absolute top-40 -right-24 h-72 w-72 rounded-full bg-success/20 blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />
      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/60 text-accent-foreground text-xs font-medium border border-border/60">
            <Sparkles className="h-3 w-3" /> Now with AI Demand Forecasting v2
          </span>
          <h1 className="mt-6 text-5xl lg:text-6xl font-bold leading-[1.05]">
            Smart Inventory &<br />
            <span className="text-gradient">Business Management</span>
            <br />
            with AI
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            StockIQ unifies stock, sales, suppliers and reporting — then layers AI on top to predict
            demand, cut losses and grow profit. Role-based dashboards for every team.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-elegant hover:opacity-90 transition"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center h-12 px-6 rounded-xl border border-border bg-background hover:bg-accent font-medium transition"
            >
              View Demo
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-8 text-sm text-muted-foreground">
            <div>
              <div className="text-2xl font-bold text-foreground">99.9%</div>Uptime
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">+34%</div>Avg. profit lift
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">5k+</div>SKUs managed
            </div>
          </div>
        </div>
        <div className="relative animate-scale-in" style={{ animationDelay: "0.15s" }}>
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}

function HeroDashboard() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-primary opacity-30 blur-3xl rounded-3xl" />
      <div className="relative rounded-2xl border border-border/80 bg-card shadow-elegant overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/40">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-success/80" />
          <span className="ml-3 text-xs text-muted-foreground">stockiq.app / dashboard</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Revenue", value: "₹78.4k", up: "+18%", icon: TrendingUp },
              { label: "Stock Value", value: "₹4.2M", up: "+6%", icon: Database },
              { label: "Low Stock", value: "12", up: "alerts", icon: Bell },
            ].map((k, i) => (
              <div key={i} className="rounded-xl border border-border bg-background/60 p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{k.label}</span>
                  <k.icon className="h-3.5 w-3.5" />
                </div>
                <div className="mt-1 font-display text-lg font-semibold">{k.value}</div>
                <div className="text-[10px] text-success font-medium">{k.up}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Sales · AI Forecast</span>
              <span className="text-xs text-muted-foreground">Last 9 months</span>
            </div>
            <svg viewBox="0 0 300 100" className="w-full h-24">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.6 0.22 269)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="oklch(0.6 0.22 269)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,80 L40,70 L80,60 L120,65 L160,45 L200,35 L240,25 L300,15 L300,100 L0,100 Z"
                fill="url(#g1)"
              />
              <path
                d="M0,80 L40,70 L80,60 L120,65 L160,45 L200,35 L240,25 L300,15"
                fill="none"
                stroke="oklch(0.6 0.22 269)"
                strokeWidth="2"
              />
              <path
                d="M0,85 L40,78 L80,68 L120,70 L160,55 L200,45 L240,38 L300,28"
                fill="none"
                stroke="oklch(0.66 0.17 153)"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-3 flex items-center gap-3">
            <div className="h-9 w-9 grid place-items-center rounded-lg bg-primary/15 text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-medium">AI Insight</div>
              <div className="text-muted-foreground">Reorder SKU-1001 — demand +32% next month</div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-md bg-success/15 text-success font-medium">
              Confident
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustStrip() {
  const items = [
    "Retail Stores",
    "Warehouses",
    "Startups",
    "Distributors",
    "D2C Brands",
    "Multi-branch chains",
  ];
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Trusted by</span>
        {items.map((i) => (
          <span key={i} className="opacity-80">
            {i}
          </span>
        ))}
      </div>
    </section>
  );
}

function ProblemSolution() {
  const problems = [
    "Manual stock tracking",
    "Stock-out & overstock losses",
    "No real business insights",
    "Human entry errors",
    "Zero demand forecasting",
  ];
  const solutions = [
    "Centralized inventory in one place",
    "Real-time stock updates across branches",
    "AI demand forecasting & reorder",
    "Automated low-stock alerts",
    "Smart dashboards & reports",
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold">
          From chaos to <span className="text-gradient">clarity</span>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          The old way bleeds money. StockIQ turns daily ops into a competitive edge.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <div className="text-xs font-medium uppercase tracking-wider text-destructive mb-4">
            Without StockIQ
          </div>
          <ul className="space-y-3">
            {problems.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-success/30 bg-gradient-to-br from-success/5 to-transparent p-8 shadow-card">
          <div className="text-xs font-medium uppercase tracking-wider text-success mb-4">
            With StockIQ
          </div>
          <ul className="space-y-3">
            {solutions.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    {
      icon: Boxes,
      title: "Inventory Management",
      text: "Track stock across branches with real-time sync and alerts.",
    },
    {
      icon: BarChart3,
      title: "Sales & Invoicing",
      text: "Create orders, generate invoices and track payments fast.",
    },
    {
      icon: Bot,
      title: "AI Demand Forecast",
      text: "Predict 7/30/90-day demand with confidence scores.",
    },
    {
      icon: Bell,
      title: "Smart Stock Alerts",
      text: "Low-stock, expiry and overstock alerts before they hurt.",
    },
    {
      icon: LineChart,
      title: "Analytics & Reports",
      text: "P&L, GST, inventory valuation — exportable in 1 click.",
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Access",
      text: "Admin, Manager, Staff, Viewer — clean permissions.",
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center mb-14">
        <span className="text-sm font-medium text-primary">Core Features</span>
        <h2 className="mt-2 text-3xl lg:text-4xl font-bold">
          Everything you need to run inventory
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {feats.map((f, i) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-card p-6 shadow-card hover-lift animate-fade-up"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="h-11 w-11 rounded-xl grid place-items-center bg-gradient-primary text-primary-foreground shadow-glow group-hover:scale-110 transition">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Roles() {
  const roles = [
    {
      icon: Crown,
      name: "Admin",
      color: "from-destructive/30",
      bullets: ["Full system control", "Users & settings", "Audit logs", "AI controls"],
    },
    {
      icon: Briefcase,
      name: "Manager",
      color: "from-warning/30",
      bullets: ["Sales reports", "AI forecasting", "Purchase approvals", "Stock transfers"],
    },
    {
      icon: Wrench,
      name: "Staff",
      color: "from-success/30",
      bullets: ["Stock in/out", "Sales orders", "Invoices", "Assigned tasks"],
    },
    {
      icon: Eye,
      name: "Viewer",
      color: "from-primary/30",
      bullets: ["Read-only reports", "GST & P&L", "Export PDF/Excel", "Audit access"],
    },
  ];
  return (
    <section id="roles" className="bg-muted/30 border-y border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary">Role-Based Dashboards</span>
          <h2 className="mt-2 text-3xl lg:text-4xl font-bold">
            One platform. Four powerful experiences.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((r, i) => (
            <div
              key={r.name}
              className={`relative rounded-2xl border border-border bg-card p-6 shadow-card hover-lift overflow-hidden animate-fade-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${r.color} to-transparent pointer-events-none`}
              />
              <div className="relative">
                <div className="h-11 w-11 rounded-xl grid place-items-center bg-background border border-border">
                  <r.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-bold text-lg">{r.name}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AiSection() {
  const pts = [
    "Predict future stock needs",
    "Identify best-selling products",
    "Reduce losses & overstock",
    "Data-driven decisions",
  ];
  return (
    <section id="ai" className="relative overflow-hidden bg-foreground text-background">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-1/4 h-64 w-64 rounded-full bg-primary blur-3xl animate-float" />
        <div
          className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-success blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 text-xs font-medium">
            <Zap className="h-3 w-3" /> Powered by AI
          </span>
          <h2 className="mt-4 text-4xl lg:text-5xl font-bold leading-tight">
            Your business, <span className="text-gradient">predicted</span> not guessed.
          </h2>
          <p className="mt-4 text-background/70 max-w-lg">
            StockIQ's AI engine ingests sales, seasonality, and supplier signals to forecast what
            you'll need — so you stop firefighting and start scaling.
          </p>
          <ul className="mt-8 grid sm:grid-cols-2 gap-3">
            {pts.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" /> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="rounded-2xl bg-background/5 border border-background/10 backdrop-blur p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">AI Forecast Accuracy</span>
              <span className="text-xs text-background/60">Last 90 days</span>
            </div>
            <div className="mt-4 flex items-end gap-2 h-40">
              {[60, 72, 65, 80, 76, 88, 82, 91, 87, 94, 89, 96].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-primary-glow"
                  style={{ height: `${h}%`, animation: `fade-up 0.8s ${i * 60}ms both` }}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-background/60">
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Register & Setup",
      d: "Create your workspace, add your branches and invite your team in minutes.",
    },
    {
      n: "02",
      t: "Add Products & Sales",
      d: "Import your catalog and start logging sales — or sync from your POS.",
    },
    {
      n: "03",
      t: "Get AI Insights & Alerts",
      d: "Receive forecasts, reorder suggestions and smart alerts daily.",
    },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold">Live in 3 steps</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className="relative rounded-2xl border border-border bg-card p-7 shadow-card hover-lift animate-fade-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="text-5xl font-bold text-gradient font-display">{s.n}</div>
            <h3 className="mt-3 font-semibold text-lg">{s.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    "Save time",
    "Reduce losses",
    "Increase profit",
    "Scale your business",
    "Make smarter decisions",
    "Stay audit-ready",
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="rounded-3xl border border-border bg-card p-10 shadow-card">
        <h2 className="text-2xl font-bold text-center mb-8">Why teams switch to StockIQ</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="font-medium">{i}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 lg:p-16 text-center shadow-elegant">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground">
            Start managing your business smarter today.
          </h2>
          <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
            No credit card. No setup fee. Cancel anytime.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-background text-foreground font-medium hover:opacity-90 transition"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center h-12 px-6 rounded-xl border border-primary-foreground/30 text-primary-foreground font-medium hover:bg-primary-foreground/10 transition"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-primary">
              <Boxes className="h-5 w-5 text-primary-foreground" />
            </span>
            Stock<span className="text-gradient">IQ</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            AI-powered inventory and business management for modern teams.
          </p>
          <div className="mt-4 flex gap-3">
            {[Github, Twitter, Linkedin].map((I, i) => (
              <a
                key={i}
                href="#"
                aria-label="social"
                className="h-9 w-9 grid place-items-center rounded-lg border border-border hover:bg-accent transition"
              >
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <FCol title="Product" links={["Features", "Roles", "AI Engine", "Pricing"]} />
        <FCol title="Company" links={["About", "Careers", "Blog", "Press"]} />
        <FCol title="Support" links={["Docs", "Help center", "Contact", "Status"]} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© 2026 StockIQ. All rights reserved.</span>
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3" /> Built with care for inventory teams.
          </span>
        </div>
      </div>
    </footer>
  );
}
function FCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="font-semibold mb-3 text-sm">{title}</div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="hover:text-foreground transition">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <TrustStrip />
        <ProblemSolution />
        <Features />
        <Roles />
        <AiSection />
        <HowItWorks />
        <Benefits />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
