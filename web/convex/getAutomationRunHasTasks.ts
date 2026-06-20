import type { MutationCtx } from "./_generated/server";

export async function getAutomationRunHasTasks(
  ctx: MutationCtx,
  runId: string,
) {
  const task = await ctx.db
    .query("automationTasks")
    .withIndex("by_run", (q) => q.eq("runId", runId))
    .first();

  return Boolean(task);
}
