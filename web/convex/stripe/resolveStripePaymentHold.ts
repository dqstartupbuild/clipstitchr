import type { MutationCtx } from "../_generated/server";
import { createStripePaymentHoldId } from "./createStripePaymentHoldId";

export async function resolveStripePaymentHold(
  ctx: MutationCtx,
  args: {
    chargeId: string;
    eventCreatedAt: number;
    eventId: string;
    kind: "refund" | "dispute";
    now: string;
    ownerId: string;
    stripeCustomerId: string;
    stripeInvoiceId?: string;
    stripePaymentIntentId?: string;
  },
) {
  const hold = await ctx.db
    .query("stripePaymentHolds")
    .withIndex("by_hold", (query) =>
      query.eq("holdId", createStripePaymentHoldId(args.kind, args.chargeId)),
    )
    .unique();

  if (!hold) {
    const reason =
      args.kind === "dispute"
        ? "Stripe dispute resolved before its opening event arrived"
        : "Stripe refund reversed before its adverse event arrived";
    const fields = {
      createdAt: args.now,
      holdId: createStripePaymentHoldId(args.kind, args.chargeId),
      kind: args.kind,
      ownerId: args.ownerId,
      reason,
      resolvedAt: args.now,
      resolvedByEventId: args.eventId,
      sourceEventCreatedAt: args.eventCreatedAt,
      sourceEventId: args.eventId,
      status: "resolved" as const,
      stripeChargeId: args.chargeId,
      stripeCustomerId: args.stripeCustomerId,
      stripeInvoiceId: args.stripeInvoiceId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      updatedAt: args.now,
    };
    const id = await ctx.db.insert("stripePaymentHolds", fields);

    return { ...fields, _id: id, resolvedFromOpenHold: false };
  }

  if (
    hold.sourceEventCreatedAt > args.eventCreatedAt ||
    hold.status === "resolved"
  ) {
    return { ...hold, resolvedFromOpenHold: false };
  }

  await ctx.db.patch(hold._id, {
    resolvedAt: args.now,
    resolvedByEventId: args.eventId,
    sourceEventCreatedAt: args.eventCreatedAt,
    sourceEventId: args.eventId,
    status: "resolved",
    updatedAt: args.now,
  });

  return {
    ...hold,
    status: "resolved" as const,
    resolvedFromOpenHold: true,
  };
}
