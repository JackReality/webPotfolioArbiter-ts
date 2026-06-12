import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/AppError";
import { getSessionFromRequest } from "@/lib/auth";
import * as TrainingService from "@/services/TrainingService";
import { createCheckoutSession } from "@/services/StripeService";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({});
  const session = await getSessionFromRequest(req, res);

  if (!session.id) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { trainingId } = await req.json();
  const training = await TrainingService.getById(trainingId);
  if (!training) return NextResponse.json({ error: "ERR_TRAINING_NOT_FOUND" }, { status: 404 });

  try {
    const base = req.nextUrl.origin;
    const url = await createCheckoutSession(
      training,
      session.id,
      `${base}/api/stripe/callback?session_id={CHECKOUT_SESSION_ID}`,
      `${base}/catalog`
    );
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
