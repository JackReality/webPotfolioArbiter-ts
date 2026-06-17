import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/auth";
import * as UserService from "@/services/UserService";
import * as UserTrainingService from "@/services/UserTrainingService";
import * as TrainingService from "@/services/TrainingService";
import { sendEmail } from "@/services/EmailService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export async function GET(req: NextRequest) {
  const errorUrl = new URL("/stripe-error", req.url);
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) return NextResponse.redirect(errorUrl, 303);

  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== "paid" && stripeSession.status !== "complete") {
      return NextResponse.redirect(errorUrl, 303);
    }

    const userId = Number(stripeSession.client_reference_id);
    if (!userId) return NextResponse.redirect(errorUrl, 303);

    const trainingCode = stripeSession.metadata?.training_code;
    if (!trainingCode) return NextResponse.redirect(errorUrl, 303);

    const alreadyOwned = await UserTrainingService.getByStripeSessionId(sessionId);
    if (!alreadyOwned) {
      const amountCt = stripeSession.amount_total ?? null;
      const currency = stripeSession.currency ?? null;
      await UserTrainingService.add(userId, trainingCode, sessionId, amountCt, currency);
    }

    const [training, user] = await Promise.all([
      TrainingService.getByCode(trainingCode),
      UserService.getById(userId),
    ]);
    if (!user) return NextResponse.redirect(errorUrl, 303);

    // Calcul des mises à jour utilisateur (rôle + communauté)
    const updates: Parameters<typeof UserService.update>[0] = { id: userId };

    if (!["admin", "moderator"].includes(user.role)) {
      updates.role = "client";
    }

    if (training?.axsCommunityMonths) {
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

    const allTrainings = await UserTrainingService.getByUser(userId);
    const trainingCodes = allTrainings.map((t) => t.trainingCode);

    const newRole = updates.role ?? user.role;
    const newExpire = updates.axsCommunityExpire ?? user.axsCommunityExpire;
    const communityAccess = newExpire != null && newExpire > new Date();

    const session = await getSession();
    session.id = user.id;
    session.email = user.email;
    session.displayName = user.displayName;
    session.role = newRole;
    session.language = user.language;
    session.trainings = trainingCodes;
    session.communityAccess = communityAccess;
    await session.save();

    // Email de confirmation si le template est renseigné sur la formation
    if (training?.confirmationEmailHtml) {
      const html = training.confirmationEmailHtml
        .replace(/\{\{\s*\.?(?:DisplayName|Name)\s*\}\}/g, user.displayName)
        .replace(/\{\{\s*\.?Title\s*\}\}/g, training.title);
      try {
        await sendEmail(user.email, `Confirmation d'achat — ${training.title}`, html);
      } catch {
        // Email non bloquant
      }
    }

    const successUrl = new URL(
      `/subscriber/stripe-success?code=${encodeURIComponent(trainingCode)}`,
      req.url
    );
    return NextResponse.redirect(successUrl, 303);
  } catch {
    return NextResponse.redirect(errorUrl, 303);
  }
}
