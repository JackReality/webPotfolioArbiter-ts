import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default async function StripeErrorPage() {
  const lang = await getLang();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-3xl font-bold">{t("stripeError.title", lang)}</h1>
      <p className="text-muted-foreground">{t("stripeError.message", lang)}</p>
      <div className="flex gap-3">
        <Link href="/catalog" className={buttonVariants({ variant: "outline" })}>{t("stripeError.backToCatalog", lang)}</Link>
        <Link href="/contact" className={buttonVariants()}>{t("stripeError.contactUs", lang)}</Link>
      </div>
    </div>
  );
}
