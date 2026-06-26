import fr from "@/lib/locales/fr.json";
import en from "@/lib/locales/en.json";
import es from "@/lib/locales/es.json";

type Lang = "fr" | "en" | "es";

const locales: Record<Lang, Record<string, unknown>> = { fr, en, es };

export function t(key: string, lang: string = "fr"): string {
  const locale = locales[(lang as Lang) ?? "fr"] ?? locales.fr;
  const parts = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = locale;
  for (const part of parts) {
    if (value == null || typeof value !== "object") return key;
    value = value[part];
  }
  return typeof value === "string" ? value : key;
}

export type { Lang };
