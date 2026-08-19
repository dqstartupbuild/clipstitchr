import type Stripe from "stripe";
import { v } from "convex/values";
import {
  internalMutation,
  type MutationCtx,
} from "../_generated/server";
import { grantMonthlyAllowance } from "../usage/grantMonthlyAllowance";
import { getStripeInvoiceSnapshot } from "./getStripeInvoiceSnapshot";
import { getStripePaymentHasOpenHold } from "./getStripePaymentHasOpenHold";
import { writeEntitlementHistory } from "./writeEntitlementHistory";

type RepairPaidInvoiceAllowanceArgs = {
  actor: string;
  invoiceJson: string;
  ownerId: string;
};

export type RepairPaidInvoiceAllowanceResult = {
  creditsAdded: number;
  periodCorrected: boolean;
  periodEnd: string;
  periodKey: string;
  periodStart: string;
};

export async function repairPaidInvoiceAllowanceForInvoice(
  ctx: MutationCtx,
  { actor, invoiceJson, ownerId }: RepairPaidInvoiceAllowanceArgs,
): Promise<RepairPaidInvoiceAllowanceResult> {
  const invoice = JSON.parse(invoiceJson) as Stripe.Invoice;

  if (invoice.status !== "paid") {
    throw new Error("Only a paid Stripe invoice can be repaired.");
  }

  const snapshot = getStripeInvoiceSnapshot(invoice);
  const entitlement = await ctx.db
    .query("billingEntitlements")
    .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
    .unique();

  if (!entitlement) {
    throw new Error("Billing entitlement not found.");
  }

  if (
    (snapshot.ownerId && snapshot.ownerId !== ownerId) ||
    entitlement.stripeCustomerId !== snapshot.customerId ||
    entitlement.stripeSubscriptionId !== snapshot.subscriptionId ||
    entitlement.latestPaidInvoiceId !== snapshot.invoiceId ||
    entitlement.planKey !== snapshot.planKey
  ) {
    throw new Error(
      "Paid invoice does not match the current billing entitlement.",
    );
  }

  const paymentHasOpenHold = await getStripePaymentHasOpenHold(ctx, {
    invoiceId: snapshot.invoiceId,
  });

  if (paymentHasOpenHold) {
    throw new Error("Paid invoice has an open payment hold.");
  }

  const now = new Date().toISOString();
  const eventCreatedAt = Math.floor(Date.parse(now) / 1_000);
  const eventId = `billing-period-repair:${snapshot.invoiceId}`;

  const allowance = await grantMonthlyAllowance(ctx, {
    eventId,
    invoiceId: snapshot.invoiceId,
    now,
    ownerId,
    periodEnd: snapshot.periodEnd,
    periodStart: snapshot.periodStart,
    planKey: snapshot.planKey,
    stripeSubscriptionId: snapshot.subscriptionId,
  });

  const periodCorrected =
    entitlement.currentPeriodStart !== snapshot.periodStart ||
    entitlement.currentPeriodEnd !== snapshot.periodEnd;

  if (periodCorrected) {
    await ctx.db.patch(entitlement._id, {
      currentPeriodEnd: snapshot.periodEnd,
      currentPeriodStart: snapshot.periodStart,
      updatedAt: now,
      version: entitlement.version + 1,
    });
  }

  if (periodCorrected || allowance.creditGrant > 0) {
    await writeEntitlementHistory(ctx, {
      createdAt: now,
      eventCreatedAt,
      eventId,
      eventType: "billing.support.allowance_repair",
      ownerId,
      planKey: entitlement.planKey,
      previousPlanKey: entitlement.planKey,
      previousState: entitlement.state,
      reason: `Repaired missing paid-invoice allowance by ${
        actor.trim() || "billing-support"
      }`,
      state: entitlement.state,
    });
  }

  return {
    creditsAdded: allowance.creditGrant,
    periodCorrected,
    periodEnd: snapshot.periodEnd,
    periodKey: allowance.periodKey,
    periodStart: snapshot.periodStart,
  };
}

export const repairPaidInvoiceAllowance = internalMutation({
  args: {
    actor: v.string(),
    invoiceJson: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, args) =>
    await repairPaidInvoiceAllowanceForInvoice(ctx, args),
});
