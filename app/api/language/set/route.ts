import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";

const SUPPORTED = ["fr", "en", "es"];

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? "fr";
  const returnUrl = req.nextUrl.searchParams.get("returnUrl") ?? "/";

  if (SUPPORTED.includes(lang)) {
    const cookieStore = await cookies();
    cookieStore.set("language", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });

    const session = await getSession();
    if (session.id) {
      session.language = lang;
      await session.save();
    }
  }

  const safeUrl = returnUrl.startsWith("/") ? returnUrl : "/";
  return NextResponse.redirect(new URL(safeUrl, req.url), 303);
}
