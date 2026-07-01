import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { createAutomationRunSummaryFields } from "./createAutomationRunSummaryFields";

export async function upsertAutomationRunSummary(
  ctx: MutationCtx,
  run: Doc<"automationRuns">,
) {
  const existingSummary = await ctx.db
    .query("automationRunSummaries")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", run.ownerId).eq("id", run.id),
    )
    .unique();
  const fields = createAutomationRunSummaryFields(run);

  if (existingSummary) {
    await ctx.db.patch(existingSummary._id, fields);
    return existingSummary._id;
  }

  return await ctx.db.insert("automationRunSummaries", fields);
}
