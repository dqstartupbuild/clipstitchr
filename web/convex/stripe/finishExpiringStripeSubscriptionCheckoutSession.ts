import type Stripe from "stripe";
import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";

export async function finishExpiringStripeSubscriptionCheckoutSession(
  ctx: ActionCtx,
  stripe: Stripe,
  {
    ownerId,
    stripeCheckoutSessionId,
  }: {
    ownerId: string;
    stripeCheckoutSessionId: string;
  },
) {
  const checkout = await stripe.checkout.sessions.retrieve(
    stripeCheckoutSessionId,
  );

  if (checkout.status === "complete") {
    throw new Error(
      "Your payment is still syncing. Refresh in a moment before starting another plan.",
    );
  }

  if (checkout.status !== "open" && checkout.status !== "expired") {
    throw new Error("Stripe did not return a safe Checkout status.");
  }

  if (checkout.status === "open") {
    await stripe.checkout.sessions.expire(stripeCheckoutSessionId);
  }

  return await ctx.runMutation(
    internal.billing.expireSubscriptionCheckoutSession
      .expireSubscriptionCheckoutSession,
    {
      now: new Date().toISOString(),
      ownerId,
      stripeCheckoutSessionId,
    },
  );
}
