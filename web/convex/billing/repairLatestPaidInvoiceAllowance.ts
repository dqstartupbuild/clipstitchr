import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { assertBillingSupportOperatorSecret } from "../auth/assertBillingSupportOperatorSecret";
import { createStripeSdk } from "../../lib/clipstitchr/billing/createStripeSdk";
import type { RepairPaidInvoiceAllowanceResult } from "../stripe/repairPaidInvoiceAllowance";

export const repairLatestPaidInvoiceAllowance = action({
  args: {
    actor: v.string(),
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (
    ctx,
    { actor, ownerId, secret },
  ): Promise<RepairPaidInvoiceAllowanceResult> => {
    assertBillingSupportOperatorSecret(secret);

    const entitlement = await ctx.runQuery(
      internal.billing.getEntitlementForOwner.getEntitlementForOwner,
      { ownerId },
    );

    if (!entitlement) {
      throw new Error("Billing entitlement not found.");
    }

    if (!entitlement.latestPaidInvoiceId) {
      throw new Error("Billing entitlement has no paid invoice to repair.");
    }

    const invoice = await createStripeSdk().invoices.retrieve(
      entitlement.latestPaidInvoiceId,
    );

    const result: RepairPaidInvoiceAllowanceResult = await ctx.runMutation(
      internal.stripe.repairPaidInvoiceAllowance.repairPaidInvoiceAllowance,
      {
        actor: actor.trim() || "billing-support",
        invoiceJson: JSON.stringify(invoice),
        ownerId,
      },
    );

    return result;
  },
});
