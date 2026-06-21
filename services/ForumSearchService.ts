import prisma from "@/lib/prisma";

type SearchParams = {
  query?: string;
  dateFrom?: Date;
  dateTo?: Date;
  author?: string;
  addressee?: string;
  staffOnly?: boolean;
  includeHidden?: boolean;
};

export async function search({ query, dateFrom, dateTo, author, addressee, staffOnly, includeHidden }: SearchParams) {
  const dateRange = dateFrom || dateTo
    ? { ...(dateFrom && { gte: dateFrom }), ...(dateTo && { lte: dateTo }) }
    : undefined;

  const [subjects, comments] = await Promise.all([
    prisma.forumSubject.findMany({
      where: {
        status: includeHidden ? undefined : { not: "hidden" },
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
        status: includeHidden ? undefined : "visible",
        subject: { status: includeHidden ? undefined : { not: "hidden" } },
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
