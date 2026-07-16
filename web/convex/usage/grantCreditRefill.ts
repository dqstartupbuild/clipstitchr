import type { MutationCtx } from "../_generated/server";
import { creditRefillPolicy } from "../../lib/clipstitchr/billing/creditRefillPolicy";
import { appendUsageLedgerEntry } from "./appendUsageLedgerEntry";

export async function grantCreditRefill(
  ctx: MutationCtx,
  args: {
    eventId: string;
    now: string;
    ownerId: string;
    periodKey: string;
    planKey: "starter" | "pro" | "agency";
    stripeChargeId?: string;
    stripePaymentIntentId: string;
  },
) {
  const existing = await ctx.db
    .query("creditGrants")
    .withIndex("by_payment_intent", (query) =>
      query.eq("stripePaymentIntentId", args.stripePaymentIntentId),
    )
    .unique();

  if (existing) {
    return existing.grantId;
  }

  const grantId = `refill:${args.stripePaymentIntentId}`;
  const expiresAt = new Date(
    Date.parse(args.now) + creditRefillPolicy.expiresAfterMs,
  ).toISOString();

  await ctx.db.insert("creditGrants", {
    amountConsumed: 0,
    amountGranted: creditRefillPolicy.amount,
    amountReserved: 0,
    amountRevoked: 0,
    availableFrom: args.now,
    createdAt: args.now,
    expiresAt,
    grantId,
    grantType: "refill",
    ownerId: args.ownerId,
    periodKey: args.periodKey,
    requiresActiveSubscription: true,
    sourceEventId: args.eventId,
    spendPriority: 10,
    status: "available",
    stripeChargeId: args.stripeChargeId,
    stripePaymentIntentId: args.stripePaymentIntentId,
    updatedAt: args.now,
  });
  await appendUsageLedgerEntry(ctx, {
    availableDelta: creditRefillPolicy.amount,
    consumedDelta: 0,
    createdAt: args.now,
    domainKind: "credit_refill",
    entryType: "grant",
    grantId,
    idempotencyKey: `refill-grant:${args.stripePaymentIntentId}`,
    operation: "credit_refill",
    ownerId: args.ownerId,
    periodKey: args.periodKey,
    planKeySnapshot: args.planKey,
    quantity: creditRefillPolicy.amount,
    reservedDelta: 0,
    resource: "creation_credit",
    source: "stripe_webhook",
    stripeSourceId: args.stripePaymentIntentId,
  });

  return grantId;
}
