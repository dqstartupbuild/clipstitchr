import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { createUsagePeriodKey } from "./createUsagePeriodKey";
import { getCurrentUsagePeriod } from "./getCurrentUsagePeriod";
import { getUpgradeAllowanceDelta } from "./getUpgradeAllowanceDelta";
import { appendUsageLedgerEntry } from "./appendUsageLedgerEntry";

export const reconcileDuplicateUpgradeAllowances = internalMutation({
  args: {
    actor: v.string(),
    now: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, { actor, now, ownerId }) => {
    const entitlement = await ctx.db
      .query("billingEntitlements")
      .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
      .unique();

    if (!entitlement) {
      throw new Error("Billing entitlement not found.");
    }

    const canonicalPeriodKey = createUsagePeriodKey(
      entitlement.stripeSubscriptionId,
      entitlement.currentPeriodStart,
    );
    const canonicalPeriod = await getCurrentUsagePeriod(
      ctx,
      ownerId,
      canonicalPeriodKey,
    );

    if (!canonicalPeriod) {
      return { repairedPeriods: 0 };
    }

    const subscriptionPeriods = await ctx.db
      .query("usagePeriods")
      .withIndex("by_subscription_start", (query) =>
        query.eq("stripeSubscriptionId", entitlement.stripeSubscriptionId),
      )
      .collect();
    const duplicates = subscriptionPeriods
      .filter(
        (period) =>
          period._id !== canonicalPeriod._id &&
          period.ownerId === ownerId &&
          period.periodEnd === canonicalPeriod.periodEnd &&
          period.periodStart > canonicalPeriod.periodStart,
      )
      .sort((left, right) => left.periodStart.localeCompare(right.periodStart));
    let currentPlanKey = canonicalPeriod.planKeySnapshot;
    let creationCreditsGranted = canonicalPeriod.creationCreditsGranted;
    let aiVideosGranted = canonicalPeriod.aiVideosGranted;
    let repairedPeriods = 0;

    for (const duplicate of duplicates) {
      if (
        duplicate.creationCreditsConsumed !== 0 ||
        duplicate.creationCreditsReserved !== 0 ||
        duplicate.aiVideosConsumed !== 0 ||
        duplicate.aiVideosReserved !== 0
      ) {
        throw new Error(
          "Duplicate upgrade allowance has usage and requires manual review.",
        );
      }

      const grants = await ctx.db
        .query("creditGrants")
        .withIndex("by_owner_period", (query) =>
          query.eq("ownerId", ownerId).eq("periodKey", duplicate.periodKey),
        )
        .collect();
      const monthlyGrants = grants.filter(
        (grant) => grant.grantType === "monthly",
      );

      if (monthlyGrants.length !== 1) {
        throw new Error(
          "Duplicate upgrade allowance does not have one monthly grant.",
        );
      }

      const [grant] = monthlyGrants;

      if (
        grant.amountConsumed !== 0 ||
        grant.amountReserved !== 0 ||
        grant.amountRevoked !== 0
      ) {
        throw new Error(
          "Duplicate upgrade credit grant has usage and requires manual review.",
        );
      }

      const allowanceDelta = getUpgradeAllowanceDelta({
        currentPlanKey,
        nextPlanKey: duplicate.planKeySnapshot,
        now: duplicate.createdAt,
        periodEnd: canonicalPeriod.periodEnd,
        periodStart: canonicalPeriod.periodStart,
      });

      if (
        allowanceDelta.creationCredits > grant.amountGranted ||
        allowanceDelta.aiVideos > duplicate.aiVideosGranted
      ) {
        throw new Error("Duplicate upgrade allowance cannot be repaired safely.");
      }

      const overgrant = grant.amountGranted - allowanceDelta.creationCredits;
      creationCreditsGranted += allowanceDelta.creationCredits;
      aiVideosGranted += allowanceDelta.aiVideos;

      await ctx.db.patch(grant._id, {
        amountGranted: allowanceDelta.creationCredits,
        periodKey: canonicalPeriodKey,
        updatedAt: now,
      });
      await ctx.db.delete(duplicate._id);
      await appendUsageLedgerEntry(ctx, {
        availableDelta: -overgrant,
        consumedDelta: 0,
        createdAt: now,
        domainId: duplicate.periodKey,
        domainKind: "billing_period_reconciliation",
        entryType: "adjust",
        grantId: grant.grantId,
        idempotencyKey: `upgrade-allowance-repair:${duplicate._id}`,
        operation: "monthly_allowance",
        ownerId,
        periodKey: canonicalPeriodKey,
        planKeySnapshot: duplicate.planKeySnapshot,
        quantity: -overgrant,
        reason: "Merged a duplicate prorated upgrade allowance into its billing period.",
        reservedDelta: 0,
        resource: "creation_credit",
        source: "support",
        stripeSourceId: duplicate.stripeInvoiceId,
        supportActor: actor,
      });

      currentPlanKey = duplicate.planKeySnapshot;
      repairedPeriods += 1;
    }

    if (repairedPeriods > 0) {
      const lastDuplicate = duplicates[repairedPeriods - 1];

      await ctx.db.patch(canonicalPeriod._id, {
        aiVideosGranted,
        creationCreditsGranted,
        planKeySnapshot: currentPlanKey,
        stripeInvoiceId: lastDuplicate.stripeInvoiceId,
        updatedAt: now,
      });
    }

    return { repairedPeriods };
  },
});
