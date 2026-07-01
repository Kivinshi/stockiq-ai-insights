import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, Badge } from "@/components/app-shell";
import { users } from "@/lib/mock-data";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/app/users")({
  head: () => ({ meta: [{ title: "Users — StockIQ" }] }),
  component: Users,
});

function Users() {
  return (
    <AppShell title="User Management" subtitle="Add, remove and assign roles across your team">
      <Card
        action={
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-elegant hover:opacity-90 transition">
            <UserPlus className="h-4 w-4" /> Invite user
          </button>
        }
      >
        <div className="overflow-x-auto -mx-5 -mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                {["User", "Email", "Role", "Branch", "Status", "Action"].map((h) => (
                  <th key={h} className="px-5 pb-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_td]:px-5 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-border last:[&_tr]:border-0">
              {users.map((u) => (
                <tr key={u.email} className="hover:bg-muted/40 transition">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{u.email}</td>
                  <td>
                    <Badge
                      tone={
                        u.role === "Admin"
                          ? "destructive"
                          : u.role === "Manager"
                            ? "warning"
                            : u.role === "Staff"
                              ? "success"
                              : "primary"
                      }
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td>{u.branch}</td>
                  <td>
                    <Badge tone={u.status === "active" ? "success" : "warning"}>{u.status}</Badge>
                  </td>
                  <td>
                    <button className="text-xs text-primary hover:underline">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
