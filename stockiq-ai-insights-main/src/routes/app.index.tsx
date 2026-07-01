import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getSession, dashboardPath } from "@/lib/auth";

export const Route = createFileRoute("/app/")({
  component: AppIndex,
});

function AppIndex() {
  const nav = useNavigate();
  useEffect(() => {
    const s = getSession();
    if (!s) nav({ to: "/login" });
    else nav({ to: dashboardPath(s.role) });
  }, [nav]);
  return (
    <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
      Loading…
    </div>
  );
}
