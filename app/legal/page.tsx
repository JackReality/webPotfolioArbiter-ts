import { getLang } from "@/lib/getLang";
import fr from "@/lib/locales/fr.json";
import en from "@/lib/locales/en.json";
import es from "@/lib/locales/es.json";
import LegalTabs from "./LegalTabs";

function getLocale(lang: string) {
  if (lang === "en") return en;
  if (lang === "es") return es;
  return fr;
}

export default async function LegalPage() {
  const lang = await getLang();
  const locale = getLocale(lang);
  const legal = locale.legal;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">{legal.title}</h1>
      <p className="text-muted-foreground mb-8 text-sm">{legal.intro}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <LegalTabs legal={legal as any} lang={lang} />
    </div>
  );
}
