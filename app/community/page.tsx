import { getSession } from "@/lib/auth";
import { t } from "@/lib/i18n";
import * as ForumSubjectService from "@/services/ForumSubjectService";
import * as ForumCommentService from "@/services/ForumCommentService";
import * as ForumService from "@/services/ForumService";
import * as UserService from "@/services/UserService";
import ForumView from "@/components/forum/ForumView";

export default async function CommunityPage() {
  const session = await getSession();
  const lang = session.language ?? "fr";
  const isMod = session.role === "admin" || session.role === "moderator";

  await ForumService.runAutoTasks();

  const [subjects, lastDateWithPosts, user] = await Promise.all([
    ForumSubjectService.getActive(),
    ForumCommentService.getLastDateWithPosts(),
    UserService.getById(session.id!),
  ]);

  // Spec : utiliser forum_last_read_date si non null, sinon dernière date avec des posts
  const initialDate = user?.forumLastReadDate
    ? user.forumLastReadDate.toISOString().split("T")[0]
    : lastDateWithPosts instanceof Date
    ? lastDateWithPosts.toISOString().split("T")[0]
    : null;

  const subjectsData = subjects.map((s) => ({
    ...s,
    displayName: s.displayName,
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
        lastDate={initialDate}
        lang={lang}
        userId={session.id ?? 0}
        userRole={session.role ?? "subscriber"}
        displayName={session.displayName ?? ""}
        isMod={isMod}
      />
    </main>
  );
}
