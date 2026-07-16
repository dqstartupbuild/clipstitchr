import type { MutationCtx } from "../_generated/server";
import { appendUsageLedgerEntry } from "./appendUsageLedgerEntry";
import { getCreditGrantAvailableAmount } from "./getCreditGrantAvailableAmount";

export async function restoreRevokedCreditGrant(
  ctx: MutationCtx,
  args: {
    eventId: string;
    grantId: string;
    now: string;
    planKey: "starter" | "pro" | "agency";
    reason: string;
  },
) {
  const grant = await ctx.db
    .query("creditGrants")
    .withIndex("by_grant", (query) => query.eq("grantId", args.grantId))
    .unique();

  if (!grant || grant.amountRevoked <= 0) {
    return 0;
  }

  const existingLedger = await ctx.db
    .query("usageLedgerEntries")
    .withIndex("by_idempotency_key", (query) =>
      query.eq("idempotencyKey", `restore:${args.eventId}:${grant.grantId}`),
    )
    .unique();

  if (existingLedger) {
    return existingLedger.quantity;
  }

  const amountRestored = grant.amountRevoked;
  const nextGrant = { ...grant, amountRevoked: 0 };

  await ctx.db.patch(grant._id, {
    amountRevoked: 0,
    status:
      Date.parse(grant.expiresAt) <= Date.parse(args.now)
        ? "expired"
        : getCreditGrantAvailableAmount(nextGrant) > 0
          ? "available"
          : "exhausted",
    updatedAt: args.now,
  });
  await appendUsageLedgerEntry(ctx, {
    availableDelta: amountRestored,
    consumedDelta: 0,
    createdAt: args.now,
    domainKind: "credit_grant",
    entryType: "reverse",
    grantId: grant.grantId,
    idempotencyKey: `restore:${args.eventId}:${grant.grantId}`,
    operation:
      grant.grantType === "refill" ? "credit_refill" : "monthly_allowance",
    ownerId: grant.ownerId,
    periodKey: grant.periodKey,
    planKeySnapshot: args.planKey,
    quantity: amountRestored,
    reason: args.reason,
    reservedDelta: 0,
    resource: "creation_credit",
    source: "stripe_webhook",
    stripeSourceId: args.eventId,
  });

  return amountRestored;
}
