import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import * as TrainingService from "@/services/TrainingService";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import CatalogBuyButton from "@/components/CatalogBuyButton";

export default async function CatalogPage() {
  const lang = await getLang();
  const trainings = await TrainingService.getByLanguage(lang);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Catalogue</h1>

      {trainings.length === 0 ? (
        <div className="text-center space-y-4 py-16 text-muted-foreground">
          <p>{t("formation.comingSoon", lang)}</p>
          <p className="text-sm">{t("formation.comingSoonDesc", lang)}</p>
          <Link href="/contact" className={buttonVariants({ variant: "outline" })}>Contact</Link>
        </div>
      ) : (
        trainings.map((training, i) => (
          <div key={training.id}>
            {i > 0 && <Separator className="my-10" />}
            <div>
              <h2 className="text-2xl font-semibold mb-4">{training.title}</h2>
              <div className="my-4">
                <CatalogBuyButton trainingId={training.id} lang={lang} />
              </div>
              <div
                className="prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: training.description_html }}
              />
              <div className="my-4">
                <CatalogBuyButton trainingId={training.id} lang={lang} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
