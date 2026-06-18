import { markAutomationRunStatus } from "./markAutomationRunStatus";
import type { Doc } from "./_generated/dataModel";
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
    completedTaskId,
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

  const tasks = await ctx.db
    .query("automationTasks")
    .withIndex("by_run", (q) => q.eq("runId", runId))
    .collect();
  const allTasksCompleted = tasks.every((task: Doc<"automationTasks">) =>
    task.id === completedTaskId ? true : task.status === "completed",
  );

  if (!allTasksCompleted) {
    return;
  }

  await markAutomationRunStatus(ctx, {
    runDocumentId: run._id,
    status: "completed",
    updatedAt,
  });
}
