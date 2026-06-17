import prisma from "@/lib/prisma";
import { AppError } from "@/lib/AppError";
import type { Training } from "@prisma/client";

export async function getById(id: number): Promise<Training | null> {
  return prisma.training.findUnique({ where: { id } });
}

export async function getAll(): Promise<Training[]> {
  return prisma.training.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getByLanguage(language: string): Promise<Training[]> {
  return prisma.training.findMany({ where: { language }, orderBy: { createdAt: "desc" } });
}

export async function getByCode(code: string): Promise<Training | null> {
  return prisma.training.findUnique({ where: { code } });
}

export async function getByCodes(codes: string[]): Promise<Training[]> {
  if (codes.length === 0) return [];
  return prisma.training.findMany({ where: { code: { in: codes } } });
}

export async function add(data: Omit<Training, "id" | "createdAt">): Promise<number> {
  const training = await prisma.training.create({ data });
  return training.id;
}

export async function update(data: Partial<Training> & { id: number }): Promise<void> {
  const { id, ...fields } = data;
  await prisma.training.update({ where: { id }, data: fields });
}

export async function remove(id: number): Promise<void> {
  const training = await getById(id);
  if (!training) throw new AppError("ERR_TRAINING_NOT_FOUND");
  await prisma.training.delete({ where: { id } });
}
