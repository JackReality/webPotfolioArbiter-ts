import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/AppError";
import { sendEmail } from "@/services/EmailService";
import { check, record } from "@/services/ContactGuard";

function ok() { return NextResponse.json({ ok: true }); }
function err(code: string, status = 400) { return NextResponse.json({ error: code }, { status }); }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, message, trap } = body;

  // Honeypot rempli = bot silencieux
  if (trap) return ok();

  if (!name || !email || !message) return err("ERR_FILL_ALL");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err("ERR_INVALID_EMAIL");

  try {
    check();
    const to = process.env.CONTACT_EMAIL ?? "contact@realityexplorer.com";
    const subject = `[Contact] ${name.slice(0, 100)}`;
    const html = `
      <p><strong>Nom :</strong> ${escHtml(name)}</p>
      <p><strong>Email :</strong> ${escHtml(email)}</p>
      <p><strong>Message :</strong></p>
      <p>${escHtml(message).replace(/\n/g, "<br/>")}</p>
    `;
    await sendEmail(to, subject, html, email);
    record();
    return ok();
  } catch (e) {
    if (e instanceof AppError) return err(e.code);
    return err("ERR_SYSTEM", 500);
  }
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
