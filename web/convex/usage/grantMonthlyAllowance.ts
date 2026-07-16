import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";
import { appendUsageLedgerEntry } from "./appendUsageLedgerEntry";
import { createUsagePeriodKey } from "./createUsagePeriodKey";
import { getCurrentUsagePeriod } from "./getCurrentUsagePeriod";
import { getUpgradeAllowanceDelta } from "./getUpgradeAllowanceDelta";

export async function grantMonthlyAllowance(
  ctx: MutationCtx,
  args: {
    eventId: string;
    invoiceId: string;
    now: string;
    ownerId: string;
    periodEnd: string;
    periodStart: string;
    planKey: PlanKey;
    stripeChargeId?: string;
    stripePaymentIntentId?: string;
    stripeSubscriptionId: string;
  },
) {
  const periodKey = createUsagePeriodKey(
    args.stripeSubscriptionId,
    args.periodStart,
  );
  const existingPeriod = await getCurrentUsagePeriod(
    ctx,
    args.ownerId,
    periodKey,
  );
  const nextPolicy = getPlanPolicy(args.planKey);

  if (!existingPeriod) {
    await ctx.db.insert("usagePeriods", {
      aiVideosAdjusted: 0,
      aiVideosConsumed: 0,
      aiVideosGranted: nextPolicy.aiVideoLimit,
      aiVideosReserved: 0,
      createdAt: args.now,
      creationCreditsAdjusted: 0,
      creationCreditsConsumed: 0,
      creationCreditsGranted: nextPolicy.monthlyCreationCredits,
      creationCreditsReserved: 0,
      grantEventId: args.eventId,
      ownerId: args.ownerId,
      periodEnd: args.periodEnd,
      periodKey,
      periodStart: args.periodStart,
      planKeySnapshot: args.planKey,
      stripeInvoiceId: args.invoiceId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      updatedAt: args.now,
    });

    const grantId = `${periodKey}:monthly`;
    await ctx.db.insert("creditGrants", {
      amountConsumed: 0,
      amountGranted: nextPolicy.monthlyCreationCredits,
      amountReserved: 0,
      amountRevoked: 0,
      availableFrom: args.periodStart,
      createdAt: args.now,
      expiresAt: args.periodEnd,
      grantId,
      grantType: "monthly",
      ownerId: args.ownerId,
      periodKey,
      requiresActiveSubscription: false,
      sourceEventId: args.eventId,
      spendPriority: 0,
      status: "available",
      stripeChargeId: args.stripeChargeId,
      stripeInvoiceId: args.invoiceId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      updatedAt: args.now,
    });
    await appendUsageLedgerEntry(ctx, {
      availableDelta: nextPolicy.monthlyCreationCredits,
      consumedDelta: 0,
      createdAt: args.now,
      domainKind: "billing_period",
      entryType: "grant",
      grantId,
      idempotencyKey: `monthly-grant:${periodKey}`,
      operation: "monthly_allowance",
      ownerId: args.ownerId,
      periodKey,
      planKeySnapshot: args.planKey,
      quantity: nextPolicy.monthlyCreationCredits,
      reservedDelta: 0,
      resource: "creation_credit",
      source: "stripe_webhook",
      stripeSourceId: args.invoiceId,
    });

    return { creditGrant: nextPolicy.monthlyCreationCredits, periodKey };
  }

  const existingEvent = await ctx.db
    .query("usageLedgerEntries")
    .withIndex("by_idempotency_key", (query) =>
      query.eq("idempotencyKey", `upgrade-grant:${args.eventId}`),
    )
    .unique();

  if (existingEvent || existingPeriod.planKeySnapshot === args.planKey) {
    return { creditGrant: 0, periodKey };
  }

  const allowanceDelta = getUpgradeAllowanceDelta({
    currentPlanKey: existingPeriod.planKeySnapshot,
    nextPlanKey: args.planKey,
    now: args.now,
    periodEnd: args.periodEnd,
    periodStart: args.periodStart,
  });
  const creditAdjustment = allowanceDelta.creationCredits;
  const videoAdjustment = allowanceDelta.aiVideos;

  if (creditAdjustment <= 0 && videoAdjustment <= 0) {
    return { creditGrant: 0, periodKey };
  }

  await ctx.db.patch(existingPeriod._id, {
    aiVideosGranted: existingPeriod.aiVideosGranted + videoAdjustment,
    creationCreditsGranted:
      existingPeriod.creationCreditsGranted + creditAdjustment,
    planKeySnapshot: args.planKey,
    updatedAt: args.now,
  });

  if (creditAdjustment > 0) {
    const grantId = `${periodKey}:upgrade:${args.eventId}`;
    await ctx.db.insert("creditGrants", {
      amountConsumed: 0,
      amountGranted: creditAdjustment,
      amountReserved: 0,
      amountRevoked: 0,
      availableFrom: args.now,
      createdAt: args.now,
      expiresAt: args.periodEnd,
      grantId,
      grantType: "monthly",
      ownerId: args.ownerId,
      periodKey,
      requiresActiveSubscription: false,
      sourceEventId: args.eventId,
      spendPriority: 0,
      status: "available",
      stripeChargeId: args.stripeChargeId,
      stripeInvoiceId: args.invoiceId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      updatedAt: args.now,
    });
    await appendUsageLedgerEntry(ctx, {
      availableDelta: creditAdjustment,
      consumedDelta: 0,
      createdAt: args.now,
      domainKind: "billing_period",
      entryType: "adjust",
      grantId,
      idempotencyKey: `upgrade-grant:${args.eventId}`,
      operation: "monthly_allowance",
      ownerId: args.ownerId,
      periodKey,
      planKeySnapshot: args.planKey,
      quantity: creditAdjustment,
      reservedDelta: 0,
      resource: "creation_credit",
      source: "stripe_webhook",
      stripeSourceId: args.invoiceId,
    });
  }

  return { creditGrant: creditAdjustment, periodKey };
}
