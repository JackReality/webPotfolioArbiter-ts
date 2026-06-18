import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import * as TrainingService from "@/services/TrainingService";
import TrainingsTable from "@/components/admin/TrainingsTable";
import Link from "next/link";

export default async function AdminTrainingsPage() {
  const lang = await getLang();
  const trainings = await TrainingService.getAll();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← {t("admin.back", lang)}
        </Link>
      </div>
      <h2 className="text-2xl font-semibold mb-2">{t("admin.trainings.title", lang)}</h2>
      <p className="text-muted-foreground text-sm mb-6">{t("admin.trainings.desc", lang)}</p>
      <TrainingsTable trainings={trainings} lang={lang} />
    </div>
  );
}
