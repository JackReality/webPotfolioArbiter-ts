import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/AppError";
import { getSession } from "@/lib/auth";
import * as TrainingService from "@/services/TrainingService";
import * as UserTrainingService from "@/services/UserTrainingService";
import { createCheckoutSession } from "@/services/StripeService";
import { logError } from "@/services/LogService";

export async function POST(req: NextRequest) {
  let userId: number | undefined;
  try {
    const session = await getSession();
    if (!session.id) return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });
    userId = session.id;

    const { trainingId } = await req.json();
    if (!trainingId) return NextResponse.json({ error: "ERR_FIELDS_REQUIRED" }, { status: 400 });

    const training = await TrainingService.getById(Number(trainingId));
    if (!training) return NextResponse.json({ error: "ERR_TRAINING_NOT_FOUND" }, { status: 404 });

    const alreadyOwned = await UserTrainingService.hasAccess(session.id, training.code);
    if (alreadyOwned) return NextResponse.json({ error: "ERR_ALREADY_PURCHASED" }, { status: 400 });

    const base = req.nextUrl.origin;
    const url = await createCheckoutSession(
      training,
      session.id,
      `${base}/api/stripe/callback?session_id={CHECKOUT_SESSION_ID}`,
      `${base}/formation`
    );
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("[stripe/checkout]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/stripe/checkout", e, userId);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
