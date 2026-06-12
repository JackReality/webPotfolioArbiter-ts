import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function NavMenu() {
  const session = await getSession();
  const lang = await getLang();
  const isLoggedIn = !!session.id;

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg text-foreground hover:text-primary transition-colors">
          Portfolio Arbiter
        </Link>

        {/* Liens centraux */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/catalog" className="text-muted-foreground hover:text-foreground transition-colors">
            {t("nav.formation", lang)}
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
          {isLoggedIn && (
            <Link href="/download" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.download", lang)}
            </Link>
          )}
        </nav>

        {/* Droite */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher current={lang} />

          {isLoggedIn ? (
            <div className="flex items-center gap-3 text-sm">
              <Link href="/myspace" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.clientArea", lang)}
              </Link>
              <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                {session.displayName}
              </Link>
              <Link
                href="/api/auth/logout"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("nav.logout", lang)}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.login", lang)}
              </Link>
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors"
              >
                {t("nav.signup", lang)}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
