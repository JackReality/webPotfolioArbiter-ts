import prisma from "@/lib/prisma";

export async function logError(route: string, e: unknown, userId?: number): Promise<void> {
  const message = e instanceof Error ? e.message : String(e);
  const stack = e instanceof Error ? (e.stack ?? null) : null;
  try {
    await prisma.logError.create({ data: { route, message, stack, userId } });
  } catch {
    console.error("[LogService] impossible d'écrire dans log_errors:", message);
  }
}
