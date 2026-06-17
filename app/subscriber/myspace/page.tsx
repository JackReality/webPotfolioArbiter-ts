import { getSession } from "@/lib/auth";
import { getByCodes } from "@/services/TrainingService";
import { getByUser } from "@/services/UserTrainingService";
import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default async function MyspacePage() {
  const session = await getSession();
  const lang = session.language ?? "fr";

  const [trainings, purchases] = await Promise.all([
    getByCodes(session.trainings ?? []),
    getByUser(session.id),
  ]);

  const purchaseMap = new Map(purchases.map((p) => [p.trainingCode, p]));

  return (
    <main className="container mx-auto py-10 space-y-8">
      <h1 className="text-2xl font-bold">{t("myspace.title", lang)}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("myspace.resources", lang)}</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/subscriber/download" className={buttonVariants()}>
            {t("myspace.download", lang)}
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("myspace.formations", lang)}</CardTitle>
        </CardHeader>
        <CardContent>
          {trainings.length === 0 ? (
            <div className="space-y-3">
              <p className="text-muted-foreground">{t("myspace.noPurchase", lang)}</p>
              <Link href="/catalog" className={buttonVariants({ variant: "outline" })}>
                {t("myspace.viewCatalog", lang)}
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("myspace.colTitle", lang)}</TableHead>
                  <TableHead>{t("myspace.colPrice", lang)}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainings.map((training) => {
                  const purchase = purchaseMap.get(training.code);
                  const price =
                    purchase?.amountCt != null
                      ? `${(purchase.amountCt / 100).toFixed(2)} ${(purchase.currency ?? "").toUpperCase()}`
                      : t("myspace.freeAccess", lang);
                  return (
                    <TableRow key={training.id}>
                      <TableCell className="font-medium">{training.title}</TableCell>
                      <TableCell>{price}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={training.pageUrl ?? "/catalog"}
                          className={buttonVariants({ size: "sm" })}
                        >
                          {t("myspace.access", lang)}
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
