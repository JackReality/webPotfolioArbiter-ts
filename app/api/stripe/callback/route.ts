import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSessionFromRequest } from "@/lib/auth";
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

    // Evite le double-enregistrement si l'utilisateur recharge la page
    const alreadyOwned = await UserTrainingService.hasAccess(userId, trainingCode);
    if (!alreadyOwned) {
      await UserTrainingService.add(userId, trainingCode, sessionId);
    }

    const user = await UserService.getById(userId);
    if (!user) return NextResponse.redirect(errorUrl, 303);

    // Passer le rôle à "client" si ce n'est pas déjà admin/moderator
    if (!["admin", "moderator"].includes(user.role)) {
      await UserService.changeRole(userId, "client");
    }

    const allTrainings = await UserTrainingService.getByUser(userId);
    const trainingCodes = allTrainings.map((t) => t.trainingCode);

    const successUrl = new URL(`/subscriber/stripe-success?code=${encodeURIComponent(trainingCode)}`, req.url);
    const res = NextResponse.redirect(successUrl, 303);

    // Mettre à jour le cookie de session
    const session = await getSessionFromRequest(req, res);
    session.id = user.id;
    session.email = user.email;
    session.displayName = user.displayName;
    session.role = ["admin", "moderator"].includes(user.role) ? user.role : "client";
    session.language = user.language;
    session.trainings = trainingCodes;
    await session.save();

    // Email de confirmation si le template est renseigné sur la formation
    const training = await TrainingService.getByCode(trainingCode);
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

    return res;
  } catch {
    return NextResponse.redirect(errorUrl, 303);
  }
}
