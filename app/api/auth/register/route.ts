import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/AppError";
import * as UserService from "@/services/UserService";
import * as EmailTemplateService from "@/services/EmailTemplateService";
import { sendEmail } from "@/services/EmailService";
import { generateCode, checkCode } from "@/services/CodeService";
import { logError } from "@/services/LogService";

function ok(data?: object) {
  return NextResponse.json({ ok: true, ...data });
}
function err(code: string, status = 400) {
  return NextResponse.json({ error: code }, { status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, email, display_name, password, passwordConfirm, code, lang = "fr" } = body;

  try {
    if (action === "send-code") {
      if (!display_name || !email || !password || !passwordConfirm) {
        return err("ERR_FIELDS_REQUIRED");
      }
      if (await UserService.emailExists(email)) return err("ERR_EMAIL_TAKEN");

      const otp = generateCode(email);
      const template = await EmailTemplateService.get("confirm_signup", lang);
      const subject = template?.subject ?? "Votre code de confirmation";
      const html = template
        ? template.html.replace(/\{\{\s*\.?Code\s*\}\}/g, otp)
        : `<p>Votre code : <strong>${otp}</strong> (valable 20 minutes).</p>`;
      await sendEmail(email, subject, html);
      return ok();
    }

    if (action === "verify") {
      if (!email || !code || !password || !display_name) return err("ERR_FIELDS_REQUIRED");
      checkCode(email, code);
      await UserService.add(email, password, display_name, lang);

      // Email de bienvenue (non bloquant)
      try {
        const template = await EmailTemplateService.get("welcome", lang);
        const subject = template?.subject ?? "Bienvenue !";
        const html = template
          ? template.html.replace(/\{\{\s*\.?DisplayName\s*\}\}/g, display_name)
          : `<p>Bonjour <strong>${display_name}</strong>, bienvenue !</p>`;
        await sendEmail(email, subject, html);
      } catch { /* non bloquant */ }

      return ok();
    }

    return err("ERR_SYSTEM");
  } catch (e) {
    if (e instanceof AppError) return err(e.code);
    console.error("[register]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/auth/register", e);
    return err("ERR_SYSTEM", 500);
  }
}
