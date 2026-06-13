import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const RED = "#841b26";

function RedLine({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="h-0.5 w-3/4" style={{ backgroundColor: RED }} />
    </div>
  );
}

function SectionSeparator() {
  return (
    <div className="flex justify-center py-3">
      <div className="h-0.5 w-3/4" style={{ backgroundColor: RED }} />
    </div>
  );
}

function TextBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-black/40 rounded-[30px] p-8">
      {children}
    </div>
  );
}

export default async function HomePage() {
  const lang = await getLang();

  return (
    <div className="text-white">

      {/* SECTION 1 — Hero */}
      <section
        className="bg-cover bg-center bg-no-repeat py-12 px-6"
        style={{ backgroundImage: "url('/images/cahier.jpg')" }}
      >
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Boîte 1 — Titre centré */}
          <TextBox>
            <p className="text-center text-base font-semibold text-white mb-1">
              {t("hero.overline", lang)}
            </p>
            <h1 className="text-5xl font-extrabold text-white text-center mb-3">
              {t("hero.title", lang)}
            </h1>
            <RedLine className="mb-3" />
            <p className="text-center text-white font-semibold">
              {t("hero.subtitle", lang)}
            </p>
          </TextBox>

          {/* Boîte 2 — Ticker */}
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <TextBox>
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                {t("moreThanSheet.title", lang)}
              </h2>
              <RedLine className="mb-4" />
              <p className="text-white/90 font-semibold whitespace-pre-line text-lg">
                {t("moreThanSheet.desc", lang)}
              </p>
            </TextBox>
            <div className="rounded-[30px] overflow-hidden shadow-2xl">
              <Image src="/images/ticker-site.png" alt={t("moreThanSheet.title", lang)} width={600} height={400} className="w-full object-cover" />
            </div>
          </div>

        </div>
      </section>

      <SectionSeparator />

      {/* SECTION 2 — Position */}
      <section
        className="bg-cover bg-center bg-no-repeat py-12 px-6"
        style={{ backgroundImage: "url('/images/position-book.png')" }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center">
          <div className="rounded-[30px] overflow-hidden shadow-2xl">
            <Image src="/images/position-site.png" alt={t("position.title", lang)} width={600} height={400} className="w-full object-cover" />
          </div>
          <TextBox>
            <h2 className="text-2xl font-bold text-white text-center mb-2">{t("position.title", lang)}</h2>
            <RedLine className="mb-4" />
            <p className="text-white/90 font-semibold whitespace-pre-line text-lg">{t("position.desc", lang)}</p>
          </TextBox>
        </div>
      </section>

      <SectionSeparator />

      {/* SECTION 3 — Stratégie */}
      <section
        className="bg-cover bg-center bg-no-repeat py-12 px-6"
        style={{ backgroundImage: "url('/images/strategie-book.png')" }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center">
          <TextBox>
            <h2 className="text-2xl font-bold text-white text-center mb-2">{t("strategy.title", lang)}</h2>
            <RedLine className="mb-4" />
            <div className="space-y-4 text-base text-white/90 font-medium">
              <div>
                <h3 className="text-white font-bold mb-1">{t("strategy.groupByStrategy", lang)}</h3>
                <p className="whitespace-pre-line">{t("strategy.groupByStrategyDesc", lang)}</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">{t("strategy.ownCash", lang)}</h3>
                <p>{t("strategy.ownCashDesc", lang)}</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">{t("strategy.autoConvert", lang)}</h3>
                <p>{t("strategy.autoConvertDesc", lang)}</p>
              </div>
            </div>
          </TextBox>
          <div className="rounded-[30px] overflow-hidden shadow-2xl">
            <Image src="/images/strategy-site.png" alt={t("strategy.title", lang)} width={600} height={400} className="w-full object-cover" />
          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* SECTION 4 — Transactions */}
      <section
        className="bg-cover bg-center bg-no-repeat py-12 px-6"
        style={{ backgroundImage: "url('/images/transactions-book.png')" }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center">
          <div className="rounded-[30px] overflow-hidden shadow-2xl">
            <Image src="/images/transaction-site.png" alt={t("transactions.title", lang)} width={600} height={400} className="w-full object-cover" />
          </div>
          <TextBox>
            <h2 className="text-2xl font-bold text-white text-center mb-2">{t("transactions.title", lang)}</h2>
            <RedLine className="mb-4" />
            <p className="text-white/90 font-semibold whitespace-pre-line text-lg">{t("transactions.desc", lang)}</p>
          </TextBox>
        </div>
      </section>

      <SectionSeparator />

      {/* SECTION 5 — Rendement */}
      <section
        className="bg-cover bg-center bg-no-repeat py-12 px-6"
        style={{ backgroundImage: "url('/images/rendement-book.png')" }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center">
          <TextBox>
            <h2 className="text-2xl font-bold text-white text-center mb-2">{t("performance.title", lang)}</h2>
            <RedLine className="mb-4" />
            <p className="text-white/90 font-semibold whitespace-pre-line text-lg">{t("performance.desc", lang)}</p>
          </TextBox>
          <div className="rounded-[30px] overflow-hidden shadow-2xl">
            <Image src="/images/rendement-site.png" alt={t("performance.title", lang)} width={600} height={400} className="w-full object-cover" />
          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* SECTION 6 — Arbitrage */}
      <section
        className="bg-cover bg-center bg-no-repeat py-12 px-6"
        style={{ backgroundImage: "url('/images/arbitrage-bg.png')" }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center">
          <div className="rounded-[30px] overflow-hidden shadow-2xl">
            <Image src="/images/rebalance-site.png" alt={t("arbitrage.title", lang)} width={600} height={400} className="w-full object-cover" />
          </div>
          <TextBox>
            <h2 className="text-2xl font-bold text-white text-center mb-2">{t("arbitrage.title", lang)}</h2>
            <RedLine className="mb-4" />
            <p className="text-white/90 font-medium whitespace-pre-line text-base mb-6">{t("arbitrage.desc", lang)}</p>
            <div className="flex justify-center">
              <Link href="/catalog" className={buttonVariants({ size: "lg" })}>{t("hero.ctaLearn", lang)}</Link>
            </div>
          </TextBox>
        </div>
      </section>


    </div>
  );
}
