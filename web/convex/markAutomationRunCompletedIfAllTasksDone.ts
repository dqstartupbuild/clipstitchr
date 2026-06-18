import { markAutomationRunStatus } from "./markAutomationRunStatus";
import type { MutationCtx } from "./_generated/server";

type MarkAutomationRunCompletedIfAllTasksDoneArgs = {
  ownerId: string;
  runId: string;
  updatedAt: string;
};

export async function markAutomationRunCompletedIfAllTasksDone(
  ctx: MutationCtx,
  { ownerId, runId, updatedAt }: MarkAutomationRunCompletedIfAllTasksDoneArgs,
) {
  const run = await ctx.db
    .query("automationRuns")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", ownerId).eq("id", runId),
    )
    .unique();

  if (!run || run.status === "completed") {
    return;
  }

  const tasks = await ctx.db
    .query("automationTasks")
    .withIndex("by_run", (q) => q.eq("runId", runId))
    .collect();

  if (tasks.length === 0 || tasks.some((task) => task.status !== "completed")) {
    return;
  }

  await markAutomationRunStatus(ctx, {
    runDocumentId: run._id,
    status: "completed",
    updatedAt,
  });
}
