import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default async function AccessDeniedPage() {
  const lang = await getLang();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-3xl font-bold">{t("accessDenied.title", lang)}</h1>
      <p className="text-muted-foreground">{t("accessDenied.message", lang)}</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>{t("common.backHome", lang)}</Link>
    </div>
  );
}
