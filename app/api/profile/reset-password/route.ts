import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as UserService from "@/services/UserService";
import * as CodeService from "@/services/CodeService";
import { AppError } from "@/lib/AppError";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.id || !session.email)
    return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });

  const { code, newPassword } = await req.json();
  if (!code || !newPassword)
    return NextResponse.json({ error: "ERR_FIELDS_REQUIRED" }, { status: 400 });

  try {
    CodeService.checkCode(session.email, code);
  } catch (ex) {
    if (ex instanceof AppError) return NextResponse.json({ error: ex.code }, { status: 400 });
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }

  try {
    await UserService.changePassword(session.id, newPassword);
    return NextResponse.json({ ok: true });
  } catch (ex) {
    if (ex instanceof AppError) return NextResponse.json({ error: ex.code }, { status: 400 });
    return NextResponse.json({ error: "Erreur système" }, { status: 500 });
  }
}
