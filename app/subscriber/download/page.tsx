import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default async function DownloadPage() {
  const lang = await getLang();
  const resourcesUrl = process.env.RESOURCES_URL ?? "#";

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">{t("download.title", lang)}</h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{t("download.cardTitle", lang)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{t("download.description", lang)}</p>
          <a href={resourcesUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants()}>
            {t("download.openSheets", lang)}
          </a>
        </CardContent>
      </Card>
    </main>
  );
}
