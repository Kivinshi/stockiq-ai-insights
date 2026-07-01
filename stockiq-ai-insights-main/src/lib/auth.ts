//// Mock auth — frontend-only. Stores role in localStorage.
//export type Role = "admin" | "manager" | "staff" | "viewer";

//export const ROLE_META: Record<Role, { label: string; color: string; description: string }> = {
//  admin:   { label: "Admin",   color: "bg-destructive/15 text-destructive",     description: "Full system control" },
//  manager: { label: "Manager", color: "bg-warning/20 text-warning-foreground",  description: "Business + reports" },
//  staff:   { label: "Staff",   color: "bg-success/15 text-success",             description: "Daily operations" },
//  viewer:  { label: "Viewer",  color: "bg-primary/15 text-primary",             description: "Read-only reports" },
//};

//const KEY = "stockiq-session";

//export type Session = { name: string; email: string; role: Role };

//export function getSession(): Session | null {
//  if (typeof window === "undefined") return null;
//  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
//}

//export function setSession(s: Session) {
//  localStorage.setItem(KEY, JSON.stringify(s));
//}

//export function clearSession() {
//  localStorage.removeItem(KEY);
//}

//export function dashboardPath(role: Role) {
//  return `/app/${role}` as const;
//}

export type Role = "admin" | "manager" | "staff" | "viewer";

export const ROLE_META: Record<Role, { label: string; color: string; description: string }> = {
  admin: {
    label: "Admin",
    color: "bg-destructive/15 text-destructive",
    description: "Full system control",
  },
  manager: {
    label: "Manager",
    color: "bg-warning/20 text-warning-foreground",
    description: "Business + reports",
  },
  staff: { label: "Staff", color: "bg-success/15 text-success", description: "Daily operations" },
  viewer: {
    label: "Viewer",
    color: "bg-primary/15 text-primary",
    description: "Read-only reports",
  },
};

const KEY = "stockiq-session";

export type Session = {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function dashboardPath(role: Role) {
  return `/app/${role}` as const;
}
