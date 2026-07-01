import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { createAutomationTaskSummaryFields } from "./createAutomationTaskSummaryFields";

export async function upsertAutomationTaskSummary(
  ctx: MutationCtx,
  task: Doc<"automationTasks">,
) {
  const existingSummary = await ctx.db
    .query("automationTaskSummaries")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", task.ownerId).eq("id", task.id),
    )
    .unique();
  const fields = createAutomationTaskSummaryFields(task);

  if (existingSummary) {
    await ctx.db.patch(existingSummary._id, fields);
    return existingSummary._id;
  }

  return await ctx.db.insert("automationTaskSummaries", fields);
}
