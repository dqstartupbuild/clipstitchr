import type { MutationCtx } from "../_generated/server";

export async function getStripeEntitlementSourceEvent(
  ctx: MutationCtx,
  eventId: string,
) {
  return await ctx.db
    .query("billingEntitlementHistory")
    .withIndex("by_event", (query) => query.eq("eventId", eventId))
    .unique();
}
