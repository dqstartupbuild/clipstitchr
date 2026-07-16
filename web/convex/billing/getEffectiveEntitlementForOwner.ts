import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getEffectiveEntitlementState } from "../../lib/clipstitchr/billing/getEffectiveEntitlementState";

export async function getEffectiveEntitlementForOwner(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  now: string,
) {
  const entitlement = await ctx.db
    .query("billingEntitlements")
    .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
    .unique();

  return entitlement
    ? {
        entitlement,
        state: getEffectiveEntitlementState(entitlement, now),
      }
    : null;
}
