import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import * as UserService from "@/services/UserService";
import * as UserTrainingService from "@/services/UserTrainingService";

export async function GET(req: NextRequest) {
  const returnUrl = req.nextUrl.searchParams.get("returnUrl") ?? "/";
  const res = NextResponse.redirect(new URL(returnUrl.startsWith("/") ? returnUrl : "/", req.url), 303);

  const session = await getSessionFromRequest(req, res);
  if (!session.id) return res;

  const user = await UserService.getById(session.id);
  if (!user) return res;

  const trainings = await UserTrainingService.getByUser(user.id);
  const trainingCodes = trainings.map((t) => t.training_code);

  session.email = user.email;
  session.displayName = user.display_name;
  session.role = user.role;
  session.language = user.language;
  session.trainings = trainingCodes;
  await session.save();

  const lang = req.nextUrl.searchParams.get("lang");
  if (lang && ["fr", "en", "es"].includes(lang)) {
    res.cookies.set("language", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  return res;
}
