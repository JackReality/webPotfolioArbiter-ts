"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const LANGS = ["fr", "en", "es"] as const;

export default function LanguageSwitcher({ current }: { current: string }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-sm">
      {LANGS.map((lang, i) => (
        <span key={lang} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground">|</span>}
          <Link
            href={`/api/language/set?lang=${lang}&returnUrl=${encodeURIComponent(pathname)}`}
            className={lang === current ? "font-bold text-foreground" : "text-muted-foreground hover:text-foreground transition-colors"}
          >
            {lang.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
