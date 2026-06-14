import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as UserService from "@/services/UserService";
import * as EmailTemplateService from "@/services/EmailTemplateService";
import * as EmailService from "@/services/EmailService";
import * as CodeService from "@/services/CodeService";

export async function POST() {
  try {
    const session = await getSession();
    if (!session.id || !session.email)
      return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });

    const user = await UserService.getById(session.id);
    if (!user) return NextResponse.json({ error: "ERR_USER_NOT_FOUND" }, { status: 404 });

    const code = CodeService.generateCode(session.email);
    const template = await EmailTemplateService.get("recovery", user.language ?? "fr");

    const subject = template?.subject ?? "Votre code de modification";
    const html = template?.html
      ? template.html.replace(/\{\{\s*\.?Code\s*\}\}/g, code)
      : `<p>Votre code : <strong>${code}</strong> (valable 20 minutes).</p>`;

    await EmailService.sendEmail(session.email, subject, html);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-code] error:", err);
    return NextResponse.json({ error: "ERR_EMAIL_SEND" }, { status: 500 });
  }
}
