import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/AppError";
import { getSession } from "@/lib/auth";
import * as TrainingService from "@/services/TrainingService";
import * as UserTrainingService from "@/services/UserTrainingService";
import * as UserService from "@/services/UserService";
import { createCheckoutSession } from "@/services/StripeService";
import { buildSession } from "@/services/SessionService";
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
    if (alreadyOwned && !training.allowRepurchase) {
      return NextResponse.json({ error: "ERR_ALREADY_PURCHASED" }, { status: 400 });
    }

    if (training.isFree) {
      const user = await UserService.getById(session.id);
      if (!user) return NextResponse.json({ error: "ERR_USER_NOT_FOUND" }, { status: 404 });

      await UserTrainingService.add(session.id, training.code, null, 0, null);

      const updates: Parameters<typeof UserService.update>[0] = { id: session.id };

      if (!["admin", "moderator"].includes(user.role)) {
        updates.role = "client";
      }

      if (training.axsCommunityMonths) {
        const base =
          user.axsCommunityExpire && user.axsCommunityExpire > new Date()
            ? new Date(user.axsCommunityExpire)
            : new Date();
        base.setMonth(base.getMonth() + training.axsCommunityMonths);
        updates.axsCommunityExpire = base;
      }

      if (Object.keys(updates).length > 1) {
        await UserService.update(updates);
      }

      const [updatedUser, allTrainings] = await Promise.all([
        UserService.getById(session.id),
        UserTrainingService.getByUser(session.id),
      ]);
      Object.assign(session, buildSession(updatedUser!, allTrainings.map((t) => t.trainingCode)));
      await session.save();

      return NextResponse.json({
        url: `/subscriber/stripe-success?code=${encodeURIComponent(training.code)}`,
      });
    }

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
