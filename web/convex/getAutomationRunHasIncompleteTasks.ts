import type { MutationCtx } from "./_generated/server";

export async function getAutomationRunHasIncompleteTasks(
  ctx: MutationCtx,
  runId: string,
) {
  const [queuedTask, runningTask, failedTask, skippedTask] = await Promise.all([
    ctx.db
      .query("automationTasks")
      .withIndex("by_run_status", (q) =>
        q.eq("runId", runId).eq("status", "queued"),
      )
      .first(),
    ctx.db
      .query("automationTasks")
      .withIndex("by_run_status", (q) =>
        q.eq("runId", runId).eq("status", "running"),
      )
      .first(),
    ctx.db
      .query("automationTasks")
      .withIndex("by_run_status", (q) =>
        q.eq("runId", runId).eq("status", "failed"),
      )
      .first(),
    ctx.db
      .query("automationTasks")
      .withIndex("by_run_status", (q) =>
        q.eq("runId", runId).eq("status", "skipped"),
      )
      .first(),
  ]);

  return Boolean(queuedTask || runningTask || failedTask || skippedTask);
}
