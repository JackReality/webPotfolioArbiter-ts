import Stripe from "stripe";
import { AppError } from "@/lib/AppError";
import type { Training } from "@/types/Training";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export async function createCheckoutSession(
  training: Training,
  userId: number,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  if (!training.stripePriceId) {
    throw new AppError("ERR_STRIPE_NOT_CONFIGURED", 2030);
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: training.stripePriceId, quantity: 1 }],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: String(userId),
    metadata: { training_code: training.code },
  });

  return session.url!;
}
