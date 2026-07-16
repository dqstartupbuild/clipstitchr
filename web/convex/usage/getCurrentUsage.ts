import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";
import { getEffectiveEntitlementForOwner } from "../billing/getEffectiveEntitlementForOwner";
import { createUsagePeriodKey } from "./createUsagePeriodKey";
import { getCreditGrantAvailableAmount } from "./getCreditGrantAvailableAmount";
import { getCurrentUsagePeriod } from "./getCurrentUsagePeriod";
import { getEligibleCreditGrants } from "./getEligibleCreditGrants";

export const getCurrentUsage = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const now = new Date().toISOString();
    const effective = await getEffectiveEntitlementForOwner(ctx, ownerId, now);

    if (!effective) {
      return null;
    }

    const { entitlement, state } = effective;
    const periodKey = createUsagePeriodKey(
      entitlement.stripeSubscriptionId,
      entitlement.currentPeriodStart,
    );
    const period = await getCurrentUsagePeriod(ctx, ownerId, periodKey);
    const grants = await getEligibleCreditGrants(
      ctx,
      ownerId,
      now,
      state === "active" || state === "grace",
      entitlement.stripeSubscriptionId,
    );
    const monthlyGrants = grants.filter(
      (grant) => grant.grantType !== "refill",
    );
    const refillGrants = grants.filter((grant) => grant.grantType === "refill");
    const sumAvailable = (items: typeof grants) =>
      items.reduce(
        (total, grant) => total + getCreditGrantAvailableAmount(grant),
        0,
      );
    const activeSlots = await ctx.db
      .query("generationSlots")
      .withIndex("by_owner_state", (query) =>
        query.eq("ownerId", ownerId).eq("state", "active"),
      )
      .collect();

    return {
      activeGenerations: activeSlots.filter(
        (slot) => Date.parse(slot.expiresAt) > Date.parse(now),
      ).length,
      aiVideos: {
        consumed: period?.aiVideosConsumed ?? 0,
        limit: (period?.aiVideosGranted ?? 0) + (period?.aiVideosAdjusted ?? 0),
        reserved: period?.aiVideosReserved ?? 0,
        resetsAt: entitlement.currentPeriodEnd,
      },
      creationCredits: {
        available: sumAvailable(grants),
        monthlyRemaining: sumAvailable(monthlyGrants),
        monthlyResetsAt: entitlement.currentPeriodEnd,
        nextRefillExpiryAt: refillGrants[0]?.expiresAt,
        refillRemaining: sumAvailable(refillGrants),
        reserved: period?.creationCreditsReserved ?? 0,
      },
      entitlementState: state,
      planKey: entitlement.planKey,
    };
  },
});
