import type { MutationCtx } from "../_generated/server";
import { writeEntitlementHistory } from "./writeEntitlementHistory";

export async function markEntitlementInactiveForCustomer(
  ctx: MutationCtx,
  args: {
    customerId: string;
    eventCreatedAt: number;
    eventId: string;
    eventType: string;
    reason: string;
  },
) {
  const entitlement = await ctx.db
    .query("billingEntitlements")
    .withIndex("by_stripe_customer", (query) =>
      query.eq("stripeCustomerId", args.customerId),
    )
    .unique();

  if (!entitlement || entitlement.sourceEventCreatedAt > args.eventCreatedAt) {
    return entitlement?._id;
  }

  const now = new Date(args.eventCreatedAt * 1_000).toISOString();

  await ctx.db.patch(entitlement._id, {
    sourceEventCreatedAt: args.eventCreatedAt,
    sourceEventId: args.eventId,
    state: "inactive",
    updatedAt: now,
    version: entitlement.version + 1,
  });
  await writeEntitlementHistory(ctx, {
    createdAt: now,
    eventCreatedAt: args.eventCreatedAt,
    eventId: args.eventId,
    eventType: args.eventType,
    ownerId: entitlement.ownerId,
    planKey: entitlement.planKey,
    previousPlanKey: entitlement.planKey,
    previousState: entitlement.state,
    reason: args.reason,
    state: "inactive",
  });

  return entitlement._id;
}
