import { getSession } from "@/lib/auth";
import { t } from "@/lib/i18n";
import * as ForumSubjectService from "@/services/ForumSubjectService";
import * as ForumCommentService from "@/services/ForumCommentService";
import ForumView from "@/components/forum/ForumView";

export default async function CommunityPage() {
  const session = await getSession();
  const lang = session.language ?? "fr";
  const isMod = session.role === "admin" || session.role === "moderator";

  const [subjects, lastDate] = await Promise.all([
    ForumSubjectService.getAll(),
    ForumCommentService.getLastDateWithPosts(),
  ]);

  const subjectsData = subjects.map((s) => ({
    ...s,
    expiresAt: s.expiresAt?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt?.toISOString() ?? null,
  }));

  return (
    <main className="container mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("community.title", lang)}</h1>
      </div>
      <ForumView
        subjects={subjectsData}
        lastDate={lastDate instanceof Date ? lastDate.toISOString().split("T")[0] : null}
        lang={lang}
        userId={session.id ?? 0}
        userRole={session.role ?? "subscriber"}
        displayName={session.displayName ?? ""}
        isMod={isMod}
      />
    </main>
  );
}
