import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getCurrentUsagePeriod(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  periodKey: string,
) {
  return await ctx.db
    .query("usagePeriods")
    .withIndex("by_owner_period", (query) =>
      query.eq("ownerId", ownerId).eq("periodKey", periodKey),
    )
    .unique();
}
