//import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
//import { useEffect, useState, type ReactNode } from "react";
//import {
//  LayoutDashboard,
//  Boxes,
//  Package,
//  ShoppingCart,
//  Truck,
//  FileBarChart2,
//  Users2,
//  Bell,
//  Settings,
//  User,
//  Moon,
//  Sun,
//  LogOut,
//  Search,
//  ChevronLeft,
//  Menu,
//  X,
//  Sparkles,
//} from "lucide-react";
//export type BadgeTone = "muted" | "success" | "warning" | "destructive" | "primary";
//import { useTheme } from "@/lib/theme";
//import { clearSession, getSession, ROLE_META, type Role } from "@/lib/auth";
//import { toast } from "sonner";

//type NavItem = { to: string; label: string; icon: LucideIcon; roles: Role[] };
//const NAV: NavItem[] = [
//  { to: "/app/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] },
//  { to: "/app/manager", label: "Dashboard", icon: LayoutDashboard, roles: ["manager"] },
//  { to: "/app/staff", label: "Dashboard", icon: LayoutDashboard, roles: ["staff"] },
//  { to: "/app/viewer", label: "Dashboard", icon: LayoutDashboard, roles: ["viewer"] },
//  {
//    to: "/app/products",
//    label: "Products",
//    icon: Package,
//    roles: ["admin", "manager", "staff", "viewer"],
//  },
//  {
//    to: "/app/inventory",
//    label: "Inventory",
//    icon: Boxes,
//    roles: ["admin", "manager", "staff", "viewer"],
//  },
//  {
//    to: "/app/sales",
//    label: "Sales",
//    icon: ShoppingCart,
//    roles: ["admin", "manager", "staff", "viewer"],
//  },
//  { to: "/app/suppliers", label: "Suppliers", icon: Truck, roles: ["admin", "manager"] },
//  {
//    to: "/app/reports",
//    label: "Reports",
//    icon: FileBarChart2,
//    roles: ["admin", "manager", "viewer"],
//  },
//  { to: "/app/users", label: "Users", icon: Users2, roles: ["admin"] },
//  {
//    to: "/app/notifications",
//    label: "Notifications",
//    icon: Bell,
//    roles: ["admin", "manager", "staff", "viewer"],
//  },
//  { to: "/app/settings", label: "Settings", icon: Settings, roles: ["admin", "manager"] },
//];

//export function AppShell({
//  children,
//  title,
//  subtitle,
//}: {
//  children: ReactNode;
//  title: string;
//  subtitle?: string;
//}) {
//  const nav = useNavigate();
//  const { theme, toggle } = useTheme();
//  const [session, setSess] = useState<ReturnType<typeof getSession>>(null);
//  const [collapsed, setCollapsed] = useState(false);
//  const [mobile, setMobile] = useState(false);
//  const pathname = useRouterState({ select: (s) => s.location.pathname });

//  useEffect(() => {
//    const s = getSession();
//    if (!s) {
//      nav({ to: "/login" });
//      return;
//    }
//    setSess(s);
//  }, [nav]);

//  if (!session) return null;
//  const role = session.role;
//  const items = NAV.filter((n) => n.roles.includes(role));
//  const meta = ROLE_META[role];

//  function logout() {
//    clearSession();
//    toast.success("Signed out");
//    nav({ to: "/login" });
//  }

//  return (
//    <div className="min-h-screen flex bg-muted/30">
//      {/* Sidebar */}
//      <aside
//        className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
//      >
//        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
//          <Link to="/" className="flex items-center gap-2 font-display font-bold overflow-hidden">
//            <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-primary shrink-0">
//              <Boxes className="h-5 w-5 text-primary-foreground" />
//            </span>
//            {!collapsed && (
//              <span className="truncate">
//                Stock<span className="text-gradient">IQ</span>
//              </span>
//            )}
//          </Link>
//          <button
//            onClick={() => setCollapsed(!collapsed)}
//            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-sidebar-accent transition shrink-0"
//          >
//            <ChevronLeft
//              className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
//            />
//          </button>
//        </div>
//        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
//          {items.map((i) => {
//            const active = pathname === i.to;
//            return (
//              <Link
//                key={i.to}
//                to={i.to}
//                className={`flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition ${active ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
//              >
//                <i.icon className="h-4 w-4 shrink-0" />
//                {!collapsed && <span className="truncate">{i.label}</span>}
//              </Link>
//            );
//          })}
//        </nav>
//        <div className="p-3 border-t border-sidebar-border">
//          {!collapsed && (
//            <div className="mb-3 rounded-xl p-3 bg-gradient-primary text-primary-foreground text-xs">
//              <div className="flex items-center gap-2 font-semibold">
//                <Sparkles className="h-3 w-3" /> AI Assistant
//              </div>
//              <p className="mt-1 opacity-90">Ask: which product needs restock?</p>
//            </div>
//          )}
//          <Link
//            to="/app/profile"
//            className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition"
//          >
//            <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-semibold text-sm shrink-0">
//              {session.name.charAt(0).toUpperCase()}
//            </div>
//            {!collapsed && (
//              <div className="min-w-0 flex-1">
//                <div className="text-sm font-medium truncate">{session.name}</div>
//                <div className="text-xs text-muted-foreground truncate">{meta.label}</div>
//              </div>
//            )}
//          </Link>
//        </div>
//      </aside>

//      {/* Mobile drawer */}
//      {mobile && (
//        <div className="fixed inset-0 z-50 md:hidden">
//          <div
//            className="absolute inset-0 bg-background/80 backdrop-blur"
//            onClick={() => setMobile(false)}
//          />
//          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border p-4 animate-fade-in">
//            <div className="flex items-center justify-between mb-4">
//              <span className="font-display font-bold">StockIQ</span>
//              <button onClick={() => setMobile(false)}>
//                <X className="h-5 w-5" />
//              </button>
//            </div>
//            <nav className="space-y-1">
//              {items.map((i) => (
//                <Link
//                  key={i.to}
//                  to={i.to}
//                  onClick={() => setMobile(false)}
//                  className={`flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium ${pathname === i.to ? "bg-gradient-primary text-primary-foreground" : "hover:bg-sidebar-accent"}`}
//                >
//                  <i.icon className="h-4 w-4" /> {i.label}
//                </Link>
//              ))}
//            </nav>
//          </aside>
//        </div>
//      )}

//      {/* Main */}
//      <div className="flex-1 flex flex-col min-w-0">
//        <header className="h-16 flex items-center gap-3 px-6 bg-background/70 backdrop-blur border-b border-border sticky top-0 z-30">
//          <button
//            onClick={() => setMobile(true)}
//            className="md:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-accent"
//          >
//            <Menu className="h-4 w-4" />
//          </button>
//          <div className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg bg-muted/60 border border-border max-w-md flex-1">
//            <Search className="h-4 w-4 text-muted-foreground" />
//            <input
//              placeholder="Search products, orders, users…"
//              className="w-full bg-transparent outline-none text-sm"
//            />
//            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
//              ⌘K
//            </kbd>
//          </div>
//          <div className="ml-auto flex items-center gap-2">
//            <span
//              className={`hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${meta.color}`}
//            >
//              {meta.label}
//            </span>
//            <button
//              onClick={toggle}
//              className="h-9 w-9 grid place-items-center rounded-lg hover:bg-accent"
//              aria-label="Theme"
//            >
//              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//            </button>
//            <Link
//              to="/app/notifications"
//              className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-accent"
//            >
//              <Bell className="h-4 w-4" />
//              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse-glow" />
//            </Link>
//            <button
//              onClick={logout}
//              className="h-9 w-9 grid place-items-center rounded-lg hover:bg-accent text-muted-foreground"
//              title="Sign out"
//            >
//              <LogOut className="h-4 w-4" />
//            </button>
//          </div>
//        </header>
//        <main className="flex-1 p-6 lg:p-8">
//          <div className="mb-6 animate-fade-up">
//            <h1 className="text-2xl lg:text-3xl font-bold">{title}</h1>
//            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
//          </div>
//          <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
//            {children}
//          </div>
//        </main>
//      </div>
//    </div>
//  );
//}

//export function KpiCard({
//  label,
//  value,
//  hint,
//  icon: Icon,
//  trend,
//  accent = "primary",
//}: {
//  label: string;
//  value: string;
//  hint?: string;
//  icon: LucideIcon;
//  trend?: string;
//  accent?: "primary" | "success" | "warning" | "destructive";
//}) {
//  const tone = {
//    primary: "bg-primary/10 text-primary",
//    success: "bg-success/15 text-success",
//    warning: "bg-warning/20 text-warning-foreground",
//    destructive: "bg-destructive/15 text-destructive",
//  }[accent];
//  return (
//    <div className="rounded-2xl border border-border bg-card p-5 shadow-card hover-lift">
//      <div className="flex items-start justify-between">
//        <div>
//          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
//            {label}
//          </div>
//          <div className="mt-2 font-display text-2xl font-bold">{value}</div>
//        </div>
//        <div className={`h-10 w-10 rounded-xl grid place-items-center ${tone}`}>
//          <Icon className="h-5 w-5" />
//        </div>
//      </div>
//      {(hint || trend) && (
//        <div className="mt-3 flex items-center justify-between text-xs">
//          {trend && <span className="text-success font-medium">{trend}</span>}
//          {hint && <span className="text-muted-foreground">{hint}</span>}
//        </div>
//      )}
//    </div>
//  );
//}

//export function Card({
//  title,
//  action,
//  children,
//  className = "",
//}: {
//  title?: string;
//  action?: ReactNode;
//  children: ReactNode;
//  className?: string;
//}) {
//  return (
//    <div className={`rounded-2xl border border-border bg-card p-5 shadow-card ${className}`}>
//      {(title || action) && (
//        <div className="flex items-center justify-between mb-4">
//          {title && <h3 className="font-semibold">{title}</h3>}
//          {action}
//        </div>
//      )}
//      {children}
//    </div>
//  );
//}

//export function Badge({
//  children,
//  tone = "muted",
//}: {
//  children: ReactNode;
//  tone?: "muted" | "success" | "warning" | "destructive" | "primary";
//}) {
//  const tones = {
//    muted: "bg-muted text-muted-foreground",
//    success: "bg-success/15 text-success",
//    warning: "bg-warning/20 text-warning-foreground",
//    destructive: "bg-destructive/15 text-destructive",
//    primary: "bg-primary/15 text-primary",
//  } as const;
//  return (
//    <span
//      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md ${tones[tone]}`}
//    >
//      {children}
//    </span>
//  );
//}

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Boxes,
  Package,
  ShoppingCart,
  Truck,
  FileBarChart2,
  Users2,
  Bell,
  Settings,
  User,
  Moon,
  Sun,
  LogOut,
  Search,
  ChevronLeft,
  Menu,
  X,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { clearSession, getSession, ROLE_META, type Role } from "@/lib/auth";
import { toast } from "sonner";

export type BadgeTone = "muted" | "success" | "warning" | "destructive" | "primary";

type NavItem = { to: string; label: string; icon: LucideIcon; roles: Role[] };
const NAV: NavItem[] = [
  { to: "/app/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { to: "/app/manager", label: "Dashboard", icon: LayoutDashboard, roles: ["manager"] },
  { to: "/app/staff", label: "Dashboard", icon: LayoutDashboard, roles: ["staff"] },
  { to: "/app/viewer", label: "Dashboard", icon: LayoutDashboard, roles: ["viewer"] },
  {
    to: "/app/products",
    label: "Products",
    icon: Package,
    roles: ["admin", "manager", "staff", "viewer"],
  },
  {
    to: "/app/inventory",
    label: "Inventory",
    icon: Boxes,
    roles: ["admin", "manager", "staff", "viewer"],
  },
  {
    to: "/app/sales",
    label: "Sales",
    icon: ShoppingCart,
    roles: ["admin", "manager", "staff", "viewer"],
  },
  { to: "/app/suppliers", label: "Suppliers", icon: Truck, roles: ["admin", "manager"] },
  {
    to: "/app/reports",
    label: "Reports",
    icon: FileBarChart2,
    roles: ["admin", "manager", "viewer"],
  },
  { to: "/app/users", label: "Users", icon: Users2, roles: ["admin"] },
  {
    to: "/app/notifications",
    label: "Notifications",
    icon: Bell,
    roles: ["admin", "manager", "staff", "viewer"],
  },
  { to: "/app/settings", label: "Settings", icon: Settings, roles: ["admin", "manager"] },
];

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const nav = useNavigate();
  const { theme, toggle } = useTheme();
  const [session, setSess] = useState<ReturnType<typeof getSession>>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const s = getSession();
    if (!s) {
      nav({ to: "/login" });
      return;
    }
    setSess(s);
  }, [nav]);

  if (!session) return null;
  const role = session.role;
  const items = NAV.filter((n) => n.roles.includes(role));
  const meta = ROLE_META[role];

  function logout() {
    clearSession();
    toast.success("Signed out");
    nav({ to: "/login" });
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 font-display font-bold overflow-hidden">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-primary shrink-0">
              <Boxes className="h-5 w-5 text-primary-foreground" />
            </span>
            {!collapsed && (
              <span className="truncate">
                Stock<span className="text-gradient">IQ</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-sidebar-accent transition shrink-0"
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((i) => {
            const active = pathname === i.to;
            return (
              <Link
                key={i.to}
                to={i.to}
                className={`flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition ${active ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
              >
                <i.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{i.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          {!collapsed && (
            <div className="mb-3 rounded-xl p-3 bg-gradient-primary text-primary-foreground text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-3 w-3" /> AI Assistant
              </div>
              <p className="mt-1 opacity-90">Ask: which product needs restock?</p>
            </div>
          )}
          <Link
            to="/app/profile"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-semibold text-sm shrink-0">
              {session.name.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{session.name}</div>
                <div className="text-xs text-muted-foreground truncate">{meta.label}</div>
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur"
            onClick={() => setMobile(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-bold">StockIQ</span>
              <button onClick={() => setMobile(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {items.map((i) => (
                <Link
                  key={i.to}
                  to={i.to}
                  onClick={() => setMobile(false)}
                  className={`flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium ${pathname === i.to ? "bg-gradient-primary text-primary-foreground" : "hover:bg-sidebar-accent"}`}
                >
                  <i.icon className="h-4 w-4" /> {i.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center gap-3 px-6 bg-background/70 backdrop-blur border-b border-border sticky top-0 z-30">
          <button
            onClick={() => setMobile(true)}
            className="md:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-accent"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg bg-muted/60 border border-border max-w-md flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search products, orders, users…"
              className="w-full bg-transparent outline-none text-sm"
            />
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
              ⌘K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span
              className={`hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${meta.color}`}
            >
              {meta.label}
            </span>
            <button
              onClick={toggle}
              className="h-9 w-9 grid place-items-center rounded-lg hover:bg-accent"
              aria-label="Theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/app/notifications"
              className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-accent"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse-glow" />
            </Link>
            <button
              onClick={logout}
              className="h-9 w-9 grid place-items-center rounded-lg hover:bg-accent text-muted-foreground"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-6 animate-fade-up">
            <h1 className="text-2xl lg:text-3xl font-bold">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  accent = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  trend?: string;
  accent?: "primary" | "success" | "warning" | "destructive";
}) {
  const tone = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/15 text-destructive",
  }[accent];
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card hover-lift">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </div>
          <div className="mt-2 font-display text-2xl font-bold">{value}</div>
        </div>
        <div className={`h-10 w-10 rounded-xl grid place-items-center ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {(hint || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs">
          {trend && <span className="text-success font-medium">{trend}</span>}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-semibold">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: BadgeTone }) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/15 text-destructive",
    primary: "bg-primary/15 text-primary",
  } as const;
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
