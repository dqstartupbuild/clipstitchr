import type { MutationCtx } from "../_generated/server";
import { createStripePaymentHoldId } from "./createStripePaymentHoldId";

export async function upsertStripePaymentHold(
  ctx: MutationCtx,
  args: {
    eventCreatedAt: number;
    eventId: string;
    kind: "refund" | "dispute";
    now: string;
    ownerId: string;
    reason: string;
    stripeChargeId: string;
    stripeCustomerId: string;
    stripeInvoiceId?: string;
    stripePaymentIntentId?: string;
  },
) {
  const holdId = createStripePaymentHoldId(args.kind, args.stripeChargeId);
  const existing = await ctx.db
    .query("stripePaymentHolds")
    .withIndex("by_hold", (query) => query.eq("holdId", holdId))
    .unique();

  if (
    existing &&
    (existing.sourceEventCreatedAt > args.eventCreatedAt ||
      (existing.status === "resolved" &&
        existing.sourceEventCreatedAt === args.eventCreatedAt))
  ) {
    return { holdId: existing._id, opened: false };
  }

  const fields = {
    kind: args.kind,
    ownerId: args.ownerId,
    reason: args.reason,
    resolvedAt: undefined,
    resolvedByEventId: undefined,
    sourceEventCreatedAt: args.eventCreatedAt,
    sourceEventId: args.eventId,
    status: "open" as const,
    stripeChargeId: args.stripeChargeId,
    stripeCustomerId: args.stripeCustomerId,
    stripeInvoiceId: args.stripeInvoiceId,
    stripePaymentIntentId: args.stripePaymentIntentId,
    updatedAt: args.now,
  };

  if (existing) {
    await ctx.db.patch(existing._id, fields);
    return { holdId: existing._id, opened: true };
  }

  const holdIdDocument = await ctx.db.insert("stripePaymentHolds", {
    ...fields,
    createdAt: args.now,
    holdId,
  });

  return { holdId: holdIdDocument, opened: true };
}
