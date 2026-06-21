import prisma from "@/lib/prisma";
import type { ForumSubject } from "@prisma/client";

export async function getAll() {
  const now = new Date();
  await prisma.forumSubject.updateMany({
    where: { status: "open", expiresAt: { lt: now } },
    data: { status: "archived", updatedAt: now },
  });
  return prisma.forumSubject.findMany({
    where: { status: { notIn: ["archived", "hidden"] } },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { comments: true } } },
  });
}

export async function getHidden() {
  return prisma.forumSubject.findMany({
    where: { status: "hidden" },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });
}

export async function getArchived() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return prisma.forumSubject.findMany({
    where: { status: "archived", updatedAt: { gte: oneYearAgo } },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });
}

export async function getById(id: number): Promise<ForumSubject | null> {
  return prisma.forumSubject.findUnique({ where: { id } });
}

export async function getByIdWithCount(id: number) {
  return prisma.forumSubject.findUnique({
    where: { id },
    include: { _count: { select: { comments: true } } },
  });
}

export async function add(
  userId: number,
  displayName: string,
  type: string,
  title: string,
  content: string,
  expiresAt: Date | null,
  isStaff: boolean
): Promise<number> {
  const subject = await prisma.forumSubject.create({
    data: { userId, displayName, type, title, content, expiresAt, isStaff },
  });
  return subject.id;
}

export async function update(data: Partial<ForumSubject> & { id: number }): Promise<void> {
  const { id, ...fields } = data;
  await prisma.forumSubject.update({ where: { id }, data: fields });
}

export async function remove(id: number): Promise<void> {
  const count = await prisma.forumComment.count({ where: { forumSubjectId: id } });
  if (count === 0) {
    await prisma.forumSubject.delete({ where: { id } });
  } else {
    await prisma.forumSubject.update({
      where: { id },
      data: { status: "archived", updatedAt: new Date() },
    });
  }
}

export async function setStatus(id: number, status: string): Promise<void> {
  await prisma.forumSubject.update({
    where: { id },
    data: { status, updatedAt: new Date() },
  });
}

export async function setPin(id: number, isPinned: boolean): Promise<void> {
  await prisma.forumSubject.update({ where: { id }, data: { isPinned } });
}
