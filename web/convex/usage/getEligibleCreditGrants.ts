import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getCreditGrantAvailableAmount } from "./getCreditGrantAvailableAmount";

export async function getEligibleCreditGrants(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  now: string,
  entitlementIsActive: boolean,
) {
  const grants = await ctx.db
    .query("creditGrants")
    .withIndex("by_owner_status_priority_expiry", (query) =>
      query.eq("ownerId", ownerId).eq("status", "available"),
    )
    .order("asc")
    .take(200);
  const nowMs = Date.parse(now);

  return grants.filter(
    (grant) =>
      Date.parse(grant.availableFrom) <= nowMs &&
      Date.parse(grant.expiresAt) > nowMs &&
      (!grant.requiresActiveSubscription || entitlementIsActive) &&
      getCreditGrantAvailableAmount(grant) > 0,
  );
}
