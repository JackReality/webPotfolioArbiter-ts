import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function HomePage() {
  const lang = await getLang();

  return (
    <div>
      {/* SECTION 1 — Hero */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-24"
        style={{ backgroundImage: "url('/images/cahier.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="bg-black/70 rounded-xl p-8 mb-10 max-w-xl">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">
              {t("hero.overline", lang)}
            </p>
            <div className="w-10 h-0.5 bg-primary mb-4" />
            <h1 className="text-4xl font-bold mb-3">{t("hero.title", lang)}</h1>
            <p className="text-muted-foreground">{t("hero.subtitle", lang)}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-black/70 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-3">{t("moreThanSheet.title", lang)}</h2>
              <div className="w-8 h-0.5 bg-primary mb-4" />
              <p className="text-muted-foreground whitespace-pre-line text-sm">{t("moreThanSheet.desc", lang)}</p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <Image src="/images/ticker-site.png" alt={t("moreThanSheet.title", lang)} width={600} height={400} className="w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* SECTION 2 — Position */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-20"
        style={{ backgroundImage: "url('/images/position-book.png')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <Image src="/images/position-site.png" alt={t("position.title", lang)} width={600} height={400} className="w-full object-cover" />
            </div>
            <div className="bg-black/70 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-3">{t("position.title", lang)}</h2>
              <div className="w-8 h-0.5 bg-primary mb-4" />
              <p className="text-muted-foreground whitespace-pre-line text-sm">{t("position.desc", lang)}</p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* SECTION 3 — Stratégie */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-20"
        style={{ backgroundImage: "url('/images/strategie-book.png')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-black/70 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-3">{t("strategy.title", lang)}</h2>
              <div className="w-8 h-0.5 bg-primary mb-4" />
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="text-foreground font-medium mb-1">{t("strategy.groupByStrategy", lang)}</h3>
                  <p className="whitespace-pre-line">{t("strategy.groupByStrategyDesc", lang)}</p>
                </div>
                <div>
                  <h3 className="text-foreground font-medium mb-1">{t("strategy.ownCash", lang)}</h3>
                  <p>{t("strategy.ownCashDesc", lang)}</p>
                </div>
                <div>
                  <h3 className="text-foreground font-medium mb-1">{t("strategy.autoConvert", lang)}</h3>
                  <p>{t("strategy.autoConvertDesc", lang)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <Image src="/images/strategy-site.png" alt={t("strategy.title", lang)} width={600} height={400} className="w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* SECTION 4 — Transactions */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-20"
        style={{ backgroundImage: "url('/images/transactions-book.png')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <Image src="/images/transaction-site.png" alt={t("transactions.title", lang)} width={600} height={400} className="w-full object-cover" />
            </div>
            <div className="bg-black/70 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-3">{t("transactions.title", lang)}</h2>
              <div className="w-8 h-0.5 bg-primary mb-4" />
              <p className="text-muted-foreground whitespace-pre-line text-sm">{t("transactions.desc", lang)}</p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* SECTION 5 — Rendement */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-20"
        style={{ backgroundImage: "url('/images/rendement-book.png')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-black/70 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-3">{t("performance.title", lang)}</h2>
              <div className="w-8 h-0.5 bg-primary mb-4" />
              <p className="text-muted-foreground whitespace-pre-line text-sm">{t("performance.desc", lang)}</p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <Image src="/images/rendement-site.png" alt={t("performance.title", lang)} width={600} height={400} className="w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* SECTION 6 — Arbitrage + CTA */}
      <section
        className="relative bg-cover bg-center bg-no-repeat py-20"
        style={{ backgroundImage: "url('/images/arbitrage-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <Image src="/images/rebalance-site.png" alt={t("arbitrage.title", lang)} width={600} height={400} className="w-full object-cover" />
            </div>
            <div className="bg-black/70 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-3">{t("arbitrage.title", lang)}</h2>
              <div className="w-8 h-0.5 bg-primary mb-4" />
              <p className="text-muted-foreground whitespace-pre-line text-sm mb-6">{t("arbitrage.desc", lang)}</p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/register" className={buttonVariants({ size: "lg" })}>{t("hero.ctaCopy", lang)}</Link>
                <Link href="/catalog" className={buttonVariants({ variant: "outline", size: "lg" })}>{t("hero.ctaLearn", lang)}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Portfolio Arbiter — {t("footer.rights", lang)}</p>
        <Link href="/legal" className="hover:text-foreground transition-colors">{t("footer.legal", lang)}</Link>
      </footer>
    </div>
  );
}
