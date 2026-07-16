import type { MutationCtx } from "../_generated/server";

export async function resolveStripeOwnerId(
  ctx: MutationCtx,
  args: {
    customerId?: string;
    metadataOwnerId?: string;
    subscriptionId?: string;
  },
) {
  if (args.metadataOwnerId) {
    return args.metadataOwnerId;
  }

  if (args.subscriptionId) {
    const bySubscription = await ctx.db
      .query("billingEntitlements")
      .withIndex("by_stripe_subscription", (query) =>
        query.eq("stripeSubscriptionId", args.subscriptionId!),
      )
      .unique();

    if (bySubscription) {
      return bySubscription.ownerId;
    }
  }

  if (args.customerId) {
    const byCustomer = await ctx.db
      .query("billingEntitlements")
      .withIndex("by_stripe_customer", (query) =>
        query.eq("stripeCustomerId", args.customerId!),
      )
      .unique();

    if (byCustomer) {
      return byCustomer.ownerId;
    }
  }

  throw new Error("Unable to map the Stripe event to a ClipStitchr owner.");
}
