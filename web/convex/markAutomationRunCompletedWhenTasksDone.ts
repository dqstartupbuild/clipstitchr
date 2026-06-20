import { markAutomationRunStatus } from "./markAutomationRunStatus";
import { getAutomationRunHasIncompleteTasks } from "./getAutomationRunHasIncompleteTasks";
import type { MutationCtx } from "./_generated/server";

type MarkAutomationRunCompletedWhenTasksDoneArgs = {
  completedTaskId: string;
  ownerId: string;
  runId: string;
  updatedAt: string;
};

export async function markAutomationRunCompletedWhenTasksDone(
  ctx: MutationCtx,
  {
    ownerId,
    runId,
    updatedAt,
  }: MarkAutomationRunCompletedWhenTasksDoneArgs,
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

  const incompleteTask = await getAutomationRunHasIncompleteTasks(ctx, runId);

  if (incompleteTask) {
    return;
  }

  await markAutomationRunStatus(ctx, {
    runDocumentId: run._id,
    status: "completed",
    updatedAt,
  });
}
