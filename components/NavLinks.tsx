"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, UserCircle } from "lucide-react";

const RED = "#841b26";
const LANGS = ["fr", "en", "es"] as const;

interface NavItem { href: string; label: string }

interface Props {
  items: NavItem[];
  lang: string;
  isLoggedIn: boolean;
  labels: {
    login: string;
    logout: string;
    profile: string;
  };
}

export default function NavLinks({ items, lang, isLoggedIn, labels }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  const linkClass = (href: string) =>
    isActive(href)
      ? "font-semibold transition-colors"
      : "text-muted-foreground hover:text-foreground transition-colors";

  const linkStyle = (href: string): React.CSSProperties | undefined =>
    isActive(href) ? { color: RED } : undefined;

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6 text-sm">
        {items.map(({ href, label }) => (
          <Link key={href} href={href} className={linkClass(href)} style={linkStyle(href)}>
            {label}
          </Link>
        ))}
      </nav>

      {/* Bouton hamburger */}
      <button
        className="md:hidden p-2 text-foreground"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border z-50 px-6 py-5 flex flex-col gap-4 text-sm">

          {/* Liens nav */}
          {items.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)} style={linkStyle(href)} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}

          <div className="border-t border-border" />

          {/* Langue */}
          <div className="flex items-center gap-3">
            {LANGS.map((l) => (
              <a
                key={l}
                href={`/api/language/set?lang=${l}&returnUrl=${encodeURIComponent(pathname)}`}
                className="font-medium transition-colors"
                style={l === lang ? { color: RED } : { color: "var(--muted-foreground)" }}
              >
                {l.toUpperCase()}
              </a>
            ))}
          </div>

          <div className="border-t border-border" />

          {/* Auth */}
          {isLoggedIn ? (
            <>
              <Link href="/subscriber/profile" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
                <UserCircle className="h-5 w-5" />
                {labels.profile}
              </Link>
              <a href="/api/auth/logout" className="text-muted-foreground hover:text-foreground transition-colors">
                {labels.logout}
              </a>
            </>
          ) : (
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
              {labels.login}
            </Link>
          )}
        </div>
      )}
    </>
  );
}
