import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import { getByCode } from "@/services/TrainingService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ code?: string }>;
}

export default async function StripeSuccessPage({ searchParams }: Props) {
  const lang = await getLang();
  const { code } = await searchParams;
  const training = code ? await getByCode(code) : null;

  return (
    <main className="container mx-auto py-10 flex justify-center">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl">{t("stripeSuccess.title", lang)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {training ? (
            <>
              <p className="text-muted-foreground">{t("stripeSuccess.accessNow", lang)}</p>
              <p className="text-xl font-semibold">{training.title}</p>
              <Link href={training.privatePageUrl ?? "#"} className={buttonVariants({ className: "w-full" })}>
                {t("stripeSuccess.goToTraining", lang)}
              </Link>
            </>
          ) : (
            <p className="text-muted-foreground">{t("stripeSuccess.registered", lang)}</p>
          )}
          <Link href="/subscriber/myspace" className={buttonVariants({ variant: "outline", className: "w-full" })}>
            {t("stripeSuccess.mySpace", lang)}
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
