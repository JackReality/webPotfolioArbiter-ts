import { getSession } from "@/lib/auth";
import { t } from "@/lib/i18n";
import ProfileForms from "./ProfileForms";

export default async function ProfilePage() {
  const session = await getSession();
  const lang = session.language ?? "fr";

  return (
    <main className="container mx-auto py-10 max-w-lg">
      <h1 className="text-2xl font-bold mb-8">{t("profile.title", lang)}</h1>
      <ProfileForms
        displayName={session.displayName}
        email={session.email}
        language={session.language}
        role={session.role}
        lang={lang}
      />
    </main>
  );
}
