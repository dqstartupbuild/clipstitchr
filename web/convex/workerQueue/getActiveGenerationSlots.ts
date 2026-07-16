import type { MutationCtx } from "../_generated/server";

export async function getActiveGenerationSlots(ctx: MutationCtx) {
  return await ctx.db
    .query("generationSlots")
    .withIndex("by_state_expiry", (query) => query.eq("state", "active"))
    .collect();
}
