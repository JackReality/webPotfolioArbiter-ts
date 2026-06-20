import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AppError } from "@/lib/AppError";
import * as UserService from "@/services/UserService";
import { logError } from "@/services/LogService";

const VALID_LANGUAGES = ["fr", "en", "es"];

function ok() { return NextResponse.json({ ok: true }); }
function err(code: string, status = 400) { return NextResponse.json({ error: code }, { status }); }

export async function POST(req: NextRequest) {
  let userId: number | undefined;
  try {
    const session = await getSession();
    if (!session.id) return err("ERR_UNAUTHORIZED", 401);
    userId = session.id;

    const { language } = await req.json();
    if (!VALID_LANGUAGES.includes(language)) return err("ERR_INVALID_LANG");

    await UserService.update({ id: session.id, language });
    return ok();
  } catch (e) {
    if (e instanceof AppError) return err(e.code);
    console.error("[set-language]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/profile/set-language", e, userId);
    return err("ERR_SYSTEM", 500);
  }
}
