import type { MutationCtx } from "../_generated/server";
import type { EntitlementState } from "../../lib/clipstitchr/billing/types/EntitlementState";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";

export async function writeEntitlementHistory(
  ctx: MutationCtx,
  args: {
    createdAt: string;
    eventCreatedAt: number;
    eventId: string;
    eventType: string;
    ownerId: string;
    planKey: PlanKey;
    previousPlanKey?: PlanKey;
    previousState?: EntitlementState;
    reason: string;
    state: EntitlementState;
  },
) {
  const existing = await ctx.db
    .query("billingEntitlementHistory")
    .withIndex("by_event", (query) => query.eq("eventId", args.eventId))
    .unique();

  if (existing) {
    return existing._id;
  }

  return await ctx.db.insert("billingEntitlementHistory", args);
}
