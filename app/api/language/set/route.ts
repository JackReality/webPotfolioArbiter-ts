import { NextRequest, NextResponse } from "next/server";

const SUPPORTED = ["fr", "en", "es"];

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? "fr";
  const returnUrl = req.nextUrl.searchParams.get("returnUrl") ?? "/";

  const res = NextResponse.redirect(new URL(returnUrl.startsWith("/") ? returnUrl : "/", req.url), 303);

  if (SUPPORTED.includes(lang)) {
    res.cookies.set("language", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  return res;
}
