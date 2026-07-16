import type { MutationCtx } from "../_generated/server";
import { appendUsageLedgerEntry } from "./appendUsageLedgerEntry";
import { getCreditGrantAvailableAmount } from "./getCreditGrantAvailableAmount";

export async function revokeCreditGrant(
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

  if (!grant) {
    return { amountRevoked: 0, consumedAmount: 0, ownerId: null };
  }

  const existingLedger = await ctx.db
    .query("usageLedgerEntries")
    .withIndex("by_idempotency_key", (query) =>
      query.eq("idempotencyKey", `revoke:${args.eventId}:${grant.grantId}`),
    )
    .unique();

  if (existingLedger) {
    return {
      amountRevoked: existingLedger.quantity,
      consumedAmount: grant.amountConsumed,
      ownerId: grant.ownerId,
    };
  }

  const amountRevoked = getCreditGrantAvailableAmount(grant);

  await ctx.db.patch(grant._id, {
    amountRevoked: grant.amountRevoked + amountRevoked,
    status: "revoked",
    updatedAt: args.now,
  });

  if (amountRevoked > 0) {
    await appendUsageLedgerEntry(ctx, {
      availableDelta: -amountRevoked,
      consumedDelta: 0,
      createdAt: args.now,
      domainKind: "credit_grant",
      entryType: "revoke",
      grantId: grant.grantId,
      idempotencyKey: `revoke:${args.eventId}:${grant.grantId}`,
      operation:
        grant.grantType === "refill" ? "credit_refill" : "monthly_allowance",
      ownerId: grant.ownerId,
      periodKey: grant.periodKey,
      planKeySnapshot: args.planKey,
      quantity: amountRevoked,
      reason: args.reason,
      reservedDelta: 0,
      resource: "creation_credit",
      source: "stripe_webhook",
      stripeSourceId: args.eventId,
    });
  }

  return {
    amountRevoked,
    consumedAmount: grant.amountConsumed,
    ownerId: grant.ownerId,
  };
}
