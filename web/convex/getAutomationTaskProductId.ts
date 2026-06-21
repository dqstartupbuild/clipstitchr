import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function getAutomationTaskProductId(
  ctx: MutationCtx,
  task: Doc<"automationTasks">,
) {
  if (task.productId !== undefined) {
    return task.productId;
  }

  const run = await ctx.db
    .query("automationRuns")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", task.ownerId).eq("id", task.runId),
    )
    .unique();

  return run?.productId;
}
