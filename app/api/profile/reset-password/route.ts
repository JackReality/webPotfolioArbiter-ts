import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as UserService from "@/services/UserService";
import { AppError } from "@/lib/AppError";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });

  const valid = await UserService.verifyPassword(session.id, currentPassword);
  if (!valid)
    return NextResponse.json({ error: "ERR_PASSWORD_INVALID" }, { status: 400 });

  try {
    await UserService.changePassword(session.id, newPassword);
    return NextResponse.json({ ok: true });
  } catch (ex) {
    if (ex instanceof AppError) return NextResponse.json({ error: ex.code }, { status: 400 });
    return NextResponse.json({ error: "Erreur système" }, { status: 500 });
  }
}
