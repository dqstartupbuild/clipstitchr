import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function deleteAutomationRunSummary(
  ctx: MutationCtx,
  run: Pick<Doc<"automationRuns">, "id" | "ownerId">,
) {
  const existingSummary = await ctx.db
    .query("automationRunSummaries")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", run.ownerId).eq("id", run.id),
    )
    .unique();

  if (existingSummary) {
    await ctx.db.delete(existingSummary._id);
  }
}
