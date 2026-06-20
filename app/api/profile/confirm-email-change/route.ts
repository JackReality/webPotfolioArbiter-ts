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
    if (!session.id) return err("ERR_UNAUTHORIZED", 401);
    userId = session.id;

    const { newEmail, code } = await req.json();
    if (!newEmail || !code) return err("ERR_FIELDS_REQUIRED");

    CodeService.checkCode(newEmail, code);
    await UserService.changeEmail(session.id, newEmail);
    return ok();
  } catch (e) {
    if (e instanceof AppError) return err(e.code);
    console.error("[confirm-email-change]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/profile/confirm-email-change", e, userId);
    return err("ERR_SYSTEM", 500);
  }
}
