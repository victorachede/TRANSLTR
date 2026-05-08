import { Link, useLocation } from "wouter";
import { Mic, LayoutDashboard, ExternalLink } from "lucide-react";

export default function Nav() {
  const [pathname] = useLocation();
  if (pathname === "/projector") return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(6,6,6,0.85)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
            style={{
              background: "var(--accent)",
              color: "var(--text-inverse)",
              fontFamily: "var(--font-display)",
            }}
          >
            T
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            TRANSLTR
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {[
            { href: "/translator", label: "Translator", icon: Mic },
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          ].map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${active ? "nav-dot" : ""}`}
                style={{
                  fontFamily: "var(--font-body)",
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  background: active ? "var(--bg-elevated)" : "transparent",
                  border: active
                    ? "1px solid var(--border-default)"
                    : "1px solid transparent",
                }}
              >
                <Icon size={12} />
                {label}
              </Link>
            );
          })}
          <a
            href="/projector"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ml-1"
            style={{
              color: "var(--text-tertiary)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.05em",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <ExternalLink size={10} />
            LIVE VIEW
          </a>
        </nav>
      </div>
    </header>
  );
}
