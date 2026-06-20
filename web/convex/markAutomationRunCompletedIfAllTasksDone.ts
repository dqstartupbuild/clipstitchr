import { markAutomationRunStatus } from "./markAutomationRunStatus";
import { getAutomationRunHasIncompleteTasks } from "./getAutomationRunHasIncompleteTasks";
import { getAutomationRunHasTasks } from "./getAutomationRunHasTasks";
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

  const [hasTasks, hasIncompleteTasks] = await Promise.all([
    getAutomationRunHasTasks(ctx, runId),
    getAutomationRunHasIncompleteTasks(ctx, runId),
  ]);

  if (!hasTasks || hasIncompleteTasks) {
    return;
  }

  await markAutomationRunStatus(ctx, {
    runDocumentId: run._id,
    status: "completed",
    updatedAt,
  });
}
