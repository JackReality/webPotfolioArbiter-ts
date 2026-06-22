import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default async function NotFound() {
  const lang = await getLang();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <h1 className="text-2xl font-bold">{t("common.notFound.title", lang)}</h1>
      <p className="text-muted-foreground">{t("common.notFound.desc", lang)}</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>{t("common.backHome", lang)}</Link>
    </div>
  );
}
