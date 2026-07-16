import type { MutationCtx } from "../_generated/server";

export async function resolveStripeOwnerId(
  ctx: MutationCtx,
  args: {
    customerId?: string;
    metadataOwnerId?: string;
    subscriptionId?: string;
  },
) {
  const [bySubscription, byCustomer] = await Promise.all([
    args.subscriptionId
      ? ctx.db
          .query("billingEntitlements")
          .withIndex("by_stripe_subscription", (query) =>
            query.eq("stripeSubscriptionId", args.subscriptionId!),
          )
          .unique()
      : null,
    args.customerId
      ? ctx.db
          .query("billingEntitlements")
          .withIndex("by_stripe_customer", (query) =>
            query.eq("stripeCustomerId", args.customerId!),
          )
          .unique()
      : null,
  ]);
  const ownerIds = new Set(
    [args.metadataOwnerId?.trim(), bySubscription?.ownerId, byCustomer?.ownerId]
      .filter((ownerId): ownerId is string => Boolean(ownerId))
      .map((ownerId) => ownerId.trim()),
  );

  if (ownerIds.size > 1) {
    throw new Error("Stripe billing ownership metadata conflicts with stored ownership.");
  }

  const [ownerId] = ownerIds;

  if (!ownerId) {
    throw new Error("Unable to map the Stripe event to a ClipStitchr owner.");
  }

  return ownerId;
}
