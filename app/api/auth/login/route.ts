import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as UserService from "@/services/UserService";
import * as UserTrainingService from "@/services/UserTrainingService";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const returnUrl = String(formData.get("returnUrl") ?? "/");

  const errorUrl = new URL("/login", req.url);
  errorUrl.searchParams.set("error", "1");
  errorUrl.searchParams.set("returnUrl", returnUrl);

  const user = await UserService.getByEmail(email);
  if (!user) return NextResponse.redirect(errorUrl, 303);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.redirect(errorUrl, 303);

  const trainings = await UserTrainingService.getByUser(Number(user.id));
  const trainingCodes = trainings.map((t) => t.trainingCode);

  const session = await getSession();
  session.id = Number(user.id);
  session.email = user.email;
  session.displayName = user.displayName;
  session.role = user.role;
  session.language = user.language;
  session.trainings = trainingCodes;
  await session.save();

  const res = NextResponse.redirect(new URL(returnUrl.startsWith("/") ? returnUrl : "/", req.url), 303);
  res.cookies.set("language", user.language, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
