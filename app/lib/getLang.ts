import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/auth";

const sessionOptions = {
  cookieName: "session",
  password: process.env.SESSION_SECRET ?? "changeme-au-moins-32-caracteres-secret",
  cookieOptions: { secure: process.env.NODE_ENV === "production", httpOnly: true },
};

export async function getLang(): Promise<string> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.language) return session.language;
  return cookieStore.get("language")?.value ?? "fr";
}
