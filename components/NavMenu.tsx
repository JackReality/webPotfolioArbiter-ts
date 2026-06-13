import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import NavLinks from "./NavLinks";

export default async function NavMenu() {
  const session = await getSession();
  const lang = await getLang();
  const isLoggedIn = !!session.id;

  const navItems = [
    { href: "/", label: t("nav.home", lang) },
    { href: "/subscriber/download", label: t("nav.download", lang) },
    { href: "/catalog", label: t("nav.formation", lang) },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4 relative">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logo-white.png"
            alt="Portfolio Arbiter"
            width={220}
            height={56}
            className="h-12 w-auto"
          />
        </Link>

        {/* Liens de navigation + hamburger */}
        <NavLinks
          items={navItems}
          lang={lang}
          isLoggedIn={isLoggedIn}
          displayName={session.displayName}
          labels={{
            login: t("nav.login", lang),
            logout: t("nav.logout", lang),
            profile: t("nav.profile", lang),
            clientArea: t("nav.clientArea", lang),
          }}
        />

        {/* Droite desktop : langue + auth */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher current={lang} />

          {isLoggedIn ? (
            <div className="flex items-center gap-3 text-sm">
              <Link href="/subscriber/myspace" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.clientArea", lang)}
              </Link>
              <Link href="/subscriber/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                {session.displayName}
              </Link>
              <Link href="/api/auth/logout" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.logout", lang)}
              </Link>
            </div>
          ) : (
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.login", lang)}
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
