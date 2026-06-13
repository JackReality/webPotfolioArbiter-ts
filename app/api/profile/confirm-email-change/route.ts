import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as UserService from "@/services/UserService";
import * as CodeService from "@/services/CodeService";
import { AppError } from "@/lib/AppError";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { newEmail, code } = await req.json();

  try {
    CodeService.checkCode(newEmail, code);
    await UserService.changeEmail(session.id, newEmail);
    return NextResponse.json({ ok: true });
  } catch (ex) {
    if (ex instanceof AppError) return NextResponse.json({ error: ex.code }, { status: 400 });
    return NextResponse.json({ error: "Erreur système" }, { status: 500 });
  }
}
