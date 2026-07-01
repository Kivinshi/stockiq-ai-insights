import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, Badge, type BadgeTone } from "@/components/app-shell";
import { apiGet, apiPut } from "@/lib/api";
import { AlertTriangle, Bell, Bot, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications - StockIQ" }] }),
  component: Notifications,
});

type AppNotification = {
  id: string;
  title: string;
  body: string;
  tone: BadgeTone;
  type: "system" | "stock" | "order" | "ai";
  isRead: boolean;
  time: string;
};

function notificationIcon(type: AppNotification["type"], tone: BadgeTone) {
  if (type === "ai") return Bot;
  if (type === "stock") return AlertTriangle;
  if (tone === "success") return CheckCircle2;
  return Bell;
}

function Notifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await apiGet<AppNotification[]>("/api/notifications");
      setNotifications(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markRead(id: string) {
    try {
      await apiPut(`/api/notifications/${id}/read`, {});
      await loadNotifications();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update notification");
    }
  }

  return (
    <AppShell title="Notifications" subtitle="Alerts, AI suggestions and system updates">
      <Card>
        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No notifications.</div>
        ) : (
          <ul className="divide-y divide-border -my-3">
            {notifications.map((n) => {
              const Icon = notificationIcon(n.type, n.tone);

              return (
                <li
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) markRead(n.id);
                  }}
                  className={`py-4 flex gap-4 hover:bg-muted/30 -mx-5 px-5 transition ${
                    n.isRead ? "opacity-60" : "cursor-pointer"
                  }`}
                >
                  <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{n.title}</span>
                      <Badge tone={n.tone}>{n.tone}</Badge>
                      {!n.isRead && <Badge tone="primary">new</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  </div>

                  <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </AppShell>
  );
}
