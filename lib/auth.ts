import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  id: number;
  email: string;
  displayName: string;
  role: string;
  language: string;
  trainings: string[];
}

export const sessionOptions = {
  cookieName: "session",
  password: process.env.SESSION_SECRET ?? "changeme-au-moins-32-caracteres-secret",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

