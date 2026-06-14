import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as UserService from "@/services/UserService";
import * as UserTrainingService from "@/services/UserTrainingService";

export async function GET(req: NextRequest) {
  const returnUrl = req.nextUrl.searchParams.get("returnUrl") ?? "/";
  const session = await getSession();
  if (!session.id) return NextResponse.redirect(new URL(returnUrl.startsWith("/") ? returnUrl : "/", req.url), 303);

  const user = await UserService.getById(session.id);
  if (!user) return NextResponse.redirect(new URL("/", req.url), 303);

  const trainings = await UserTrainingService.getByUser(Number(user.id));
  const trainingCodes = trainings.map((t) => t.trainingCode);

  session.email = user.email;
  session.displayName = user.displayName;
  session.role = user.role;
  session.language = user.language;
  session.trainings = trainingCodes;
  await session.save();

  const res = NextResponse.redirect(new URL(returnUrl.startsWith("/") ? returnUrl : "/", req.url), 303);

  const lang = req.nextUrl.searchParams.get("lang");
  if (lang && ["fr", "en", "es"].includes(lang)) {
    res.cookies.set("language", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  return res;
}
