import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as UserService from "@/services/UserService";
import * as CodeService from "@/services/CodeService";
import { sendEmail } from "@/services/EmailService";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { newEmail } = await req.json();
  if (!newEmail?.trim()) return NextResponse.json({ error: "Email requis" }, { status: 400 });

  if (await UserService.emailExists(newEmail))
    return NextResponse.json({ error: "ERR_EMAIL_TAKEN" }, { status: 409 });

  const code = CodeService.generateCode(newEmail);
  await sendEmail(
    newEmail,
    "Vérification de votre nouvelle adresse email",
    `<p>Votre code de vérification : <strong>${code}</strong></p><p>Valable 20 minutes.</p>`
  );

  return NextResponse.json({ ok: true });
}
