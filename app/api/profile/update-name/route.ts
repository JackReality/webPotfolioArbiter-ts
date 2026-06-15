import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AppError } from "@/lib/AppError";
import * as UserService from "@/services/UserService";
import { logError } from "@/services/LogService";

function ok() { return NextResponse.json({ ok: true }); }
function err(code: string, status = 400) { return NextResponse.json({ error: code }, { status }); }

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.id) return err("ERR_UNAUTHORIZED", 401);

    const { displayName } = await req.json();
    if (!displayName?.trim()) return err("ERR_FIELDS_REQUIRED");

    await UserService.update({ id: session.id, displayName: displayName.trim() });
    return ok();
  } catch (e) {
    if (e instanceof AppError) return err(e.code);
    console.error("[update-name]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/profile/update-name", e, session?.id);
    return err("ERR_SYSTEM", 500);
  }
}
