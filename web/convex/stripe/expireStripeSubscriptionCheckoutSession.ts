import type Stripe from "stripe";
import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";

export async function expireStripeSubscriptionCheckoutSession(
  ctx: ActionCtx,
  stripe: Stripe,
  {
    allowHandedOff,
    checkoutStatus,
    ownerId,
    stripeCheckoutSessionId,
  }: {
    allowHandedOff: boolean;
    checkoutStatus: string | null;
    ownerId: string;
    stripeCheckoutSessionId: string;
  },
) {
  if (checkoutStatus !== "open" && checkoutStatus !== "expired") {
    throw new Error("Stripe did not return a safe Checkout status.");
  }

  const expirationStarted = await ctx.runMutation(
    internal.billing.beginSubscriptionCheckoutSessionExpiration
      .beginSubscriptionCheckoutSessionExpiration,
    {
      allowHandedOff,
      now: new Date().toISOString(),
      ownerId,
      stripeCheckoutSessionId,
    },
  );

  if (!expirationStarted) {
    return false;
  }

  if (checkoutStatus === "open") {
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
