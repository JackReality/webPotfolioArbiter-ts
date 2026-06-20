import prisma from "@/lib/prisma";
import type { ForumComment } from "@prisma/client";

export async function getById(id: number): Promise<ForumComment | null> {
  return prisma.forumComment.findUnique({ where: { id } });
}

export async function getBySubject(forumSubjectId: number, includeHidden = false) {
  return prisma.forumComment.findMany({
    where: {
      forumSubjectId,
      ...(includeHidden ? {} : { status: "visible" }),
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "asc" }],
  });
}

export async function add(
  forumSubjectId: number,
  forumCommentId: number | null,
  userId: number,
  displayName: string,
  addressedTo: string | null,
  content: string
): Promise<number> {
  const comment = await prisma.forumComment.create({
    data: { forumSubjectId, forumCommentId, userId, displayName, addressedTo, content },
  });
  return comment.id;
}

export async function update(data: Partial<ForumComment> & { id: number }): Promise<void> {
  const { id, ...fields } = data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.forumComment.update({ where: { id }, data: { ...(fields as any), updatedAt: new Date() } });
}

export async function remove(id: number): Promise<void> {
  await prisma.forumComment.delete({ where: { id } });
}

export async function setPin(id: number, isPinned: boolean): Promise<void> {
  await prisma.forumComment.update({ where: { id }, data: { isPinned } });
}

export async function setStatus(id: number, status: string): Promise<void> {
  await prisma.forumComment.update({ where: { id }, data: { status } });
}

export async function setStatusCascade(id: number, status: string): Promise<void> {
  await prisma.forumComment.updateMany({
    where: { OR: [{ id }, { forumCommentId: id }] },
    data: { status },
  });
}

export async function hasReplies(id: number): Promise<boolean> {
  const count = await prisma.forumComment.count({ where: { forumCommentId: id } });
  return count > 0;
}

export async function toggleLike(id: number, userId: number): Promise<void> {
  const comment = await prisma.forumComment.findUnique({ where: { id } });
  if (!comment) return;
  const likes = (comment.likes as number[]) ?? [];
  const updated = likes.includes(userId)
    ? likes.filter((u) => u !== userId)
    : [...likes, userId];
  await prisma.forumComment.update({ where: { id }, data: { likes: updated } });
}

// --- Onglet Suivi : navigation par date ---

type DateRow = { d: Date | null };

export async function getLastDateWithPosts(): Promise<Date | null> {
  const rows = await prisma.$queryRaw<DateRow[]>`
    SELECT MAX(DATE(created_at)) AS d FROM (
      SELECT created_at FROM forum_subject
      UNION ALL
      SELECT created_at FROM forum_comment
    ) t
  `;
  return rows[0]?.d ?? null;
}

export async function getPrevDate(date: Date): Promise<Date | null> {
  const rows = await prisma.$queryRaw<DateRow[]>`
    SELECT MAX(DATE(created_at)) AS d FROM (
      SELECT created_at FROM forum_subject WHERE DATE(created_at) < DATE(${date})
      UNION ALL
      SELECT created_at FROM forum_comment WHERE DATE(created_at) < DATE(${date})
    ) t
  `;
  return rows[0]?.d ?? null;
}

export async function getNextDate(date: Date): Promise<Date | null> {
  const rows = await prisma.$queryRaw<DateRow[]>`
    SELECT MIN(DATE(created_at)) AS d FROM (
      SELECT created_at FROM forum_subject WHERE DATE(created_at) > DATE(${date})
      UNION ALL
      SELECT created_at FROM forum_comment WHERE DATE(created_at) > DATE(${date})
    ) t
  `;
  return rows[0]?.d ?? null;
}

export async function getByDate(date: Date, includeHidden = false) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const [subjects, comments] = await Promise.all([
    prisma.forumSubject.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        ...(includeHidden ? {} : { status: { not: "hidden" } }),
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.forumComment.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        ...(includeHidden ? {} : { status: "visible" }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, title: true, type: true, status: true } },
        parent: { select: { id: true, displayName: true, content: true, status: true } },
      },
    }),
  ]);

  return { subjects, comments };
}
