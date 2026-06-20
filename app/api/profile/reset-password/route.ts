import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AppError } from "@/lib/AppError";
import * as UserService from "@/services/UserService";
import * as CodeService from "@/services/CodeService";
import { logError } from "@/services/LogService";

function ok() { return NextResponse.json({ ok: true }); }
function err(code: string, status = 400) { return NextResponse.json({ error: code }, { status }); }

export async function POST(req: NextRequest) {
  let userId: number | undefined;
  try {
    const session = await getSession();
    if (!session.id || !session.email) return err("ERR_UNAUTHORIZED", 401);
    userId = session.id;

    const { code, newPassword } = await req.json();
    if (!code || !newPassword) return err("ERR_FIELDS_REQUIRED");

    CodeService.checkCode(session.email, code);
    await UserService.changePassword(session.id, newPassword);
    return ok();
  } catch (e) {
    if (e instanceof AppError) return err(e.code);
    console.error("[reset-password]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/profile/reset-password", e, userId);
    return err("ERR_SYSTEM", 500);
  }
}
