import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AppError } from "@/lib/AppError";
import * as UserService from "@/services/UserService";
import * as CodeService from "@/services/CodeService";
import * as EmailTemplateService from "@/services/EmailTemplateService";
import { sendEmail } from "@/services/EmailService";
import { logError } from "@/services/LogService";

function ok() { return NextResponse.json({ ok: true }); }
function err(code: string, status = 400) { return NextResponse.json({ error: code }, { status }); }

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.id) return err("ERR_UNAUTHORIZED", 401);

    const { newEmail } = await req.json();
    if (!newEmail?.trim()) return err("ERR_FIELDS_REQUIRED");

    if (await UserService.emailExists(newEmail)) return err("ERR_EMAIL_TAKEN");

    const code = CodeService.generateCode(newEmail);
    const template = await EmailTemplateService.get("confirm_signup", "fr");
    const subject = template?.subject ?? "Vérification de votre adresse email";
    const html = template
      ? template.html.replace(/\{\{\s*\.?Code\s*\}\}/g, code)
      : `<p>Votre code de vérification : <strong>${code}</strong> (valable 20 minutes).</p>`;
    await sendEmail(newEmail, subject, html);

    return ok();
  } catch (e) {
    if (e instanceof AppError) return err(e.code);
    console.error("[request-email-change]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/profile/request-email-change", e, session?.id);
    return err("ERR_SYSTEM", 500);
  }
}
