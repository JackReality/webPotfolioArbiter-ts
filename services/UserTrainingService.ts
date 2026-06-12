import prisma from "@/lib/prisma";
import type { UserTraining } from "@prisma/client";

export async function getById(id: number): Promise<UserTraining | null> {
  return prisma.userTraining.findUnique({ where: { id } });
}

export async function getByUser(userId: number): Promise<UserTraining[]> {
  return prisma.userTraining.findMany({ where: { userId } });
}

export async function hasAccess(userId: number, trainingCode: string): Promise<boolean> {
  const count = await prisma.userTraining.count({ where: { userId, trainingCode } });
  return count > 0;
}

export async function add(
  userId: number,
  trainingCode: string,
  stripeSessionId: string | null
): Promise<number> {
  const record = await prisma.userTraining.create({
    data: { userId, trainingCode, stripeSessionId },
  });
  return record.id;
}

export async function update(data: Partial<UserTraining> & { id: number }): Promise<void> {
  const { id, ...fields } = data;
  await prisma.userTraining.update({ where: { id }, data: fields });
}

export async function remove(id: number): Promise<void> {
  await prisma.userTraining.delete({ where: { id } });
}
