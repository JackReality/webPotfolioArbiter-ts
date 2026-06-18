import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import * as UserService from "@/services/UserService";
import UsersTable from "@/components/admin/UsersTable";
import Link from "next/link";

export default async function AdminUsersPage() {
  const lang = await getLang();
  const users = await UserService.getAll();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← {t("admin.back", lang)}
        </Link>
      </div>
      <h2 className="text-2xl font-semibold mb-2">{t("admin.users.title", lang)}</h2>
      <p className="text-muted-foreground text-sm mb-6">{t("admin.users.desc", lang)}</p>
      <UsersTable users={users} lang={lang} />
    </div>
  );
}
