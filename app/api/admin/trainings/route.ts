import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as TrainingService from "@/services/TrainingService";
import { AppError } from "@/lib/AppError";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session.role !== "admin") return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });

    const body = await req.json();
    const { title, code, language, descriptionHtml } = body;

    if (!title || !code || !language || !descriptionHtml) {
      return NextResponse.json({ error: "ERR_FIELDS_REQUIRED" }, { status: 400 });
    }

    await TrainingService.add({
      title,
      code: String(code).toUpperCase(),
      language,
      descriptionHtml,
      stripeProductId: body.stripeProductId || null,
      stripePriceId: body.stripePriceId || null,
      confirmationEmailHtml: body.confirmationEmailHtml || null,
      privatePageUrl: body.privatePageUrl || null,
      publicPageUrl: body.publicPageUrl || null,
      isFree: body.isFree ?? false,
      allowRepurchase: body.allowRepurchase ?? false,
      axsCommunityMonths: body.axsCommunityMonths ? Number(body.axsCommunityMonths) : null,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("[admin/trainings/add]", e);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
