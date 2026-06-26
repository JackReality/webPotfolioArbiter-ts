import type { User } from "@prisma/client";
import type { SessionData } from "@/lib/auth";

export function buildSession(user: User, trainingCodes: string[]): SessionData {
  const communityAccess =
    user.role === "admin" ||
    user.role === "moderator" ||
    (user.axsCommunityExpire !== null && user.axsCommunityExpire > new Date());

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    language: user.language,
    trainings: trainingCodes,
    communityAccess,
  };
}
