import prisma from "@/lib/prisma";

export async function runAutoTasks() {
  const now = new Date();
  await prisma.forumSubject.updateMany({
    where: { status: "open", expiresAt: { lt: now } },
    data: { status: "archived", updatedAt: now },
  });
}

type SearchParams = {
  query?: string;
  dateFrom?: Date;
  dateTo?: Date;
  author?: string;
  addressee?: string;
  staffOnly?: boolean;
};

export async function search({ query, dateFrom, dateTo, author, addressee, staffOnly }: SearchParams) {
  const dateRange = dateFrom || dateTo
    ? { ...(dateFrom && { gte: dateFrom }), ...(dateTo && { lte: dateTo }) }
    : undefined;

  const [subjects, comments] = await Promise.all([
    prisma.forumSubject.findMany({
      where: {
        status: { not: "hidden" },
        ...(query && { OR: [{ title: { contains: query } }, { content: { contains: query } }] }),
        ...(author && { displayName: { contains: author } }),
        ...(dateRange && { createdAt: dateRange }),
        ...(staffOnly && { isStaff: true }),
      },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { comments: true } } },
    }),
    prisma.forumComment.findMany({
      where: {
        status: "visible",
        subject: { status: { not: "hidden" } },
        ...(query && { content: { contains: query } }),
        ...(author && { displayName: { contains: author } }),
        ...(addressee && { addressedTo: { contains: addressee } }),
        ...(dateRange && { createdAt: dateRange }),
        ...(staffOnly && { isStaff: true }),
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
