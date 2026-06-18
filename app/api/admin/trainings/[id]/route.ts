import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as TrainingService from "@/services/TrainingService";
import { AppError } from "@/lib/AppError";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session.role !== "admin") return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    const training = await TrainingService.getById(Number(id));
    if (!training) return NextResponse.json({ error: "ERR_TRAINING_NOT_FOUND" }, { status: 404 });

    return NextResponse.json(training);
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("[admin/trainings/get]", e);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session.role !== "admin") return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    await TrainingService.update({
      id: Number(id),
      title: body.title,
      language: body.language,
      descriptionHtml: body.descriptionHtml,
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
    console.error("[admin/trainings/update]", e);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
