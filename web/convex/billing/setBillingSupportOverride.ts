import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertBillingSupportOperatorSecret } from "../auth/assertBillingSupportOperatorSecret";
import { entitlementStateValidator } from "../validators/entitlementState";
import { writeEntitlementHistory } from "../stripe/writeEntitlementHistory";

const MAX_OVERRIDE_MS = 7 * 24 * 60 * 60_000;

export const setBillingSupportOverride = mutation({
  args: {
    actor: v.string(),
    expiresAt: v.optional(v.string()),
    ownerId: v.string(),
    reason: v.string(),
    secret: v.string(),
    state: v.optional(entitlementStateValidator),
  },
  handler: async (ctx, args) => {
    assertBillingSupportOperatorSecret(args.secret);

    const actor = args.actor.trim();
    const reason = args.reason.trim();

    if (!actor || !reason) {
      throw new Error("Support override actor and reason are required.");
    }

    const entitlement = await ctx.db
      .query("billingEntitlements")
      .withIndex("by_owner", (query) => query.eq("ownerId", args.ownerId))
      .unique();

    if (!entitlement) {
      throw new Error("Billing entitlement not found.");
    }

    const now = new Date().toISOString();

    if (args.state) {
      const expiresAtMs = Date.parse(args.expiresAt ?? "");
      const nowMs = Date.parse(now);

      if (
        !Number.isFinite(expiresAtMs) ||
        expiresAtMs <= nowMs ||
        expiresAtMs - nowMs > MAX_OVERRIDE_MS
      ) {
        throw new Error("Support overrides must expire within seven days.");
      }
    }

    await ctx.db.patch(entitlement._id, {
      supportOverrideActor: args.state ? actor : undefined,
      supportOverrideExpiresAt: args.state ? args.expiresAt : undefined,
      supportOverrideReason: args.state ? reason : undefined,
      supportOverrideState: args.state,
      updatedAt: now,
      version: entitlement.version + 1,
    });
    await writeEntitlementHistory(ctx, {
      createdAt: now,
      eventCreatedAt: Math.floor(Date.parse(now) / 1_000),
      eventId: `support:${Date.now()}:${args.ownerId}`,
      eventType: "support.override",
      ownerId: args.ownerId,
      planKey: entitlement.planKey,
      previousPlanKey: entitlement.planKey,
      previousState: entitlement.state,
      reason: args.state
        ? `Support override by ${actor}: ${reason}`
        : `Support override cleared by ${actor}: ${reason}`,
      state: args.state ?? entitlement.state,
    });

    return { overrideState: args.state ?? null, updatedAt: now };
  },
});
