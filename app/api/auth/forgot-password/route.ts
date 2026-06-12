import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/AppError";
import * as UserService from "@/services/UserService";
import * as EmailTemplateService from "@/services/EmailTemplateService";
import { sendEmail } from "@/services/EmailService";
import { generateCode, checkCode } from "@/services/CodeService";

function ok() { return NextResponse.json({ ok: true }); }
function err(code: string, status = 400) { return NextResponse.json({ error: code }, { status }); }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, email, code, newPassword, confirmPassword } = body;

  try {
    if (action === "send-code") {
      if (!email) return err("ERR_FILL_ALL");
      // On génère et envoie le code seulement si l'email existe (pour éviter l'énumération d'utilisateurs, on répond toujours ok)
      const user = await UserService.getByEmail(email);
      if (user) {
        const otp = generateCode(email);
        const lang = user.language ?? "fr";
        const template = await EmailTemplateService.get("recovery", lang);
        const subject = template?.subject ?? "Votre code de réinitialisation";
        const html = template
          ? template.html.replace(/\{\{\s*\.?Code\s*\}\}/g, otp)
          : `<p>Votre code : <strong>${otp}</strong> (valable 20 minutes).</p>`;
        await sendEmail(email, subject, html);
      }
      return ok(); // toujours ok même si l'email n'existe pas
    }

    if (action === "verify") {
      if (!email || !code || !newPassword || !confirmPassword) return err("ERR_FILL_ALL");
      if (newPassword !== confirmPassword) return err("ERR_PASSWORD_MISMATCH");
      if (newPassword.length < 6) return err("ERR_PASSWORD_TOO_SHORT");

      checkCode(email, code);

      const user = await UserService.getByEmail(email);
      if (!user) return ok(); // silencieux
      await UserService.changePassword(user.id, newPassword);
      return ok();
    }

    return err("ERR_SYSTEM");
  } catch (e) {
    if (e instanceof AppError) return err(e.code);
    return err("ERR_SYSTEM", 500);
  }
}
