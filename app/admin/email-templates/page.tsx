import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import * as EmailTemplateService from "@/services/EmailTemplateService";
import EmailTemplatesEditor from "@/components/admin/EmailTemplatesEditor";
import Link from "next/link";

export default async function AdminEmailTemplatesPage() {
  const lang = await getLang();
  const templates = await EmailTemplateService.getAll();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← {t("admin.back", lang)}
        </Link>
      </div>
      <h2 className="text-2xl font-semibold mb-2">{t("admin.emailTemplates.title", lang)}</h2>
      <p className="text-muted-foreground text-sm mb-6">{t("admin.emailTemplates.desc", lang)}</p>
      <EmailTemplatesEditor templates={templates} lang={lang} />
    </div>
  );
}
