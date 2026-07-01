import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function deleteAutomationTaskSummary(
  ctx: MutationCtx,
  task: Pick<Doc<"automationTasks">, "id" | "ownerId">,
) {
  const existingSummary = await ctx.db
    .query("automationTaskSummaries")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", task.ownerId).eq("id", task.id),
    )
    .unique();

  if (existingSummary) {
    await ctx.db.delete(existingSummary._id);
  }
}
