import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";

export async function markCheckoutSessionCompleted(
  ctx: MutationCtx,
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
) {
  const checkout = await ctx.db
    .query("billingCheckoutSessions")
    .withIndex("by_stripe_session", (query) =>
      query.eq("stripeCheckoutSessionId", session.id),
    )
    .unique();

  if (!checkout) {
    return null;
  }

  await ctx.db.patch(checkout._id, {
    status: "completed",
    updatedAt: new Date(event.created * 1_000).toISOString(),
  });

  return checkout._id;
}
