import prisma from "@/lib/prisma";
import type { EmailTemplate } from "@prisma/client";

export async function getById(id: number): Promise<EmailTemplate | null> {
  return prisma.emailTemplate.findUnique({ where: { id } });
}

export async function getAll(): Promise<EmailTemplate[]> {
  return prisma.emailTemplate.findMany({ orderBy: [{ key: "asc" }, { language: "asc" }] });
}

export async function get(key: string, language: string): Promise<EmailTemplate | null> {
  return prisma.emailTemplate.findUnique({ where: { key_language: { key, language } } });
}

export async function update(data: Partial<EmailTemplate> & { id: number }): Promise<void> {
  const { id, ...fields } = data;
  await prisma.emailTemplate.update({ where: { id }, data: fields });
}

export async function save(id: number, subject: string, html: string): Promise<void> {
  await prisma.emailTemplate.update({ where: { id }, data: { subject, html } });
}
