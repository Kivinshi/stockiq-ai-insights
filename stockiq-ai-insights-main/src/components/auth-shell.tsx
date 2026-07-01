import { Link } from "@tanstack/react-router";
import { Boxes, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: brand */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-gradient-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white blur-3xl animate-float" />
          <div
            className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white blur-3xl animate-float"
            style={{ animationDelay: "1.5s" }}
          />
        </div>
        <Link to="/" className="relative flex items-center gap-2 font-display font-bold text-xl">
          <span className="grid place-items-center h-10 w-10 rounded-xl bg-background/20 backdrop-blur">
            <Boxes className="h-5 w-5" />
          </span>
          StockIQ
        </Link>
        <div className="relative animate-fade-up">
          <h2 className="text-4xl font-bold leading-tight">
            Run your inventory with intelligence.
          </h2>
          <p className="mt-3 text-primary-foreground/80 max-w-md">
            From real-time stock tracking to AI demand forecasts — everything in one workspace.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
            {[
              { n: "5k+", l: "SKUs" },
              { n: "99.9%", l: "Uptime" },
              { n: "+34%", l: "Profit" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-background/10 backdrop-blur p-3">
                <div className="text-2xl font-bold">{s.n}</div>
                <div className="text-xs opacity-80">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs opacity-70">© 2026 StockIQ</div>
      </div>

      {/* Right: form */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="lg:hidden flex items-center gap-2 font-display font-bold">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-primary">
              <Boxes className="h-4 w-4 text-primary-foreground" />
            </span>
            StockIQ
          </Link>
          <button
            onClick={toggle}
            className="ml-auto h-9 w-9 grid place-items-center rounded-lg hover:bg-accent transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md animate-fade-up">
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && (
              <div className="mt-6 text-sm text-center text-muted-foreground">{footer}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
