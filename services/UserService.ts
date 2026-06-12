import prisma from "@/lib/prisma";
import { AppError } from "@/lib/AppError";
import type { User } from "@prisma/client";
import bcrypt from "bcrypt";

export async function getById(id: number): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function getAll(): Promise<User[]> {
  return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function emailExists(email: string): Promise<boolean> {
  const count = await prisma.user.count({ where: { email } });
  return count > 0;
}

export async function add(
  email: string,
  password: string,
  displayName: string,
  language: string
): Promise<number> {
  if (await emailExists(email)) throw new AppError("ERR_EMAIL_TAKEN", 2001);
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, displayName, language, role: "subscriber" },
  });
  return user.id;
}

export async function update(data: Partial<User> & { id: number }): Promise<void> {
  const { id, ...fields } = data;
  await prisma.user.update({ where: { id }, data: fields });
}

export async function remove(id: number): Promise<void> {
  const user = await getById(id);
  if (!user) throw new AppError("ERR_USER_NOT_FOUND", 2002);
  if (user.role === "admin") throw new AppError("ERR_ADMIN_PROTECTED", 2003);
  await prisma.user.delete({ where: { id } });
}

export async function changePassword(id: number, newPassword: string): Promise<void> {
  if (!newPassword || newPassword.length < 6) throw new AppError("ERR_PASSWORD_TOO_SHORT", 1001);
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
}

export async function changeEmail(id: number, newEmail: string): Promise<void> {
  if (await emailExists(newEmail)) throw new AppError("ERR_EMAIL_TAKEN", 2001);
  await prisma.user.update({ where: { id }, data: { email: newEmail } });
}

export async function changeRole(id: number, newRole: string): Promise<void> {
  const user = await getById(id);
  if (!user) throw new AppError("ERR_USER_NOT_FOUND", 2002);
  if (user.role === "admin") throw new AppError("ERR_ADMIN_PROTECTED", 2003);
  await prisma.user.update({ where: { id }, data: { role: newRole } });
}

export async function verifyPassword(id: number, password: string): Promise<boolean> {
  const user = await getById(id);
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}
