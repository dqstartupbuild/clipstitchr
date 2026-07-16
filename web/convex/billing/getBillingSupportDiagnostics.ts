import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertBillingSupportOperatorSecret } from "../auth/assertBillingSupportOperatorSecret";
import { getEffectiveEntitlementState } from "../../lib/clipstitchr/billing/getEffectiveEntitlementState";

export const getBillingSupportDiagnostics = query({
  args: { ownerId: v.string(), secret: v.string() },
  handler: async (ctx, { ownerId, secret }) => {
    assertBillingSupportOperatorSecret(secret);

    const now = new Date().toISOString();
    const entitlement = await ctx.db
      .query("billingEntitlements")
      .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
      .unique();
    const [grants, periods, reservations, slots, queueEntries, ledgerEntries] =
      await Promise.all([
        ctx.db
          .query("creditGrants")
          .filter((query) => query.eq(query.field("ownerId"), ownerId))
          .order("desc")
          .take(50),
        ctx.db
          .query("usagePeriods")
          .withIndex("by_owner_period", (query) => query.eq("ownerId", ownerId))
          .order("desc")
          .take(24),
        ctx.db
          .query("usageReservations")
          .filter((query) => query.eq(query.field("ownerId"), ownerId))
          .order("desc")
          .take(50),
        ctx.db
          .query("generationSlots")
          .withIndex("by_owner_state", (query) => query.eq("ownerId", ownerId))
          .take(50),
        ctx.db
          .query("workerQueueEntries")
          .withIndex("by_owner_status", (query) => query.eq("ownerId", ownerId))
          .order("desc")
          .take(50),
        ctx.db
          .query("usageLedgerEntries")
          .withIndex("by_owner_created", (query) =>
            query.eq("ownerId", ownerId),
          )
          .order("desc")
          .take(100),
      ]);
    const webhookEvents = entitlement
      ? (
          await ctx.db.query("stripeWebhookEvents").order("desc").take(100)
        ).filter(
          (event) =>
            event.objectId === entitlement.stripeCustomerId ||
            event.objectId === entitlement.stripeSubscriptionId,
        )
      : [];

    return {
      effectiveState: entitlement
        ? getEffectiveEntitlementState(entitlement, now)
        : null,
      entitlement,
      grants,
      ledgerEntries,
      periods,
      queueEntries,
      reservations,
      slots,
      webhookEvents,
    };
  },
});
