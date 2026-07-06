import { createActiveAutomationBatchJobSummary } from "./createActiveAutomationBatchJobSummary";
import { getAutomationBatchJobType } from "./getAutomationBatchJobType";
import type { QueryCtx } from "./_generated/server";

const ACTIVE_AUTOMATION_BATCH_JOB_RUN_LIMIT = 4;
const ACTIVE_AUTOMATION_BATCH_TASK_LIMIT = 200;

function getUniqueBatchRunIds(tasks: Array<{ runId: string }>) {
  return Array.from(
    new Set(
      tasks
        .map((task) => task.runId)
        .filter((runId) => getAutomationBatchJobType(runId)),
    ),
  );
}

export async function listActiveAutomationBatchJobSummaries(
  ctx: QueryCtx,
  ownerId: string,
  limit = ACTIVE_AUTOMATION_BATCH_JOB_RUN_LIMIT,
) {
  const [queuedTasks, runningTasks] = await Promise.all([
    ctx.db
      .query("automationTaskSummaries")
      .withIndex("by_owner_status", (q) =>
        q.eq("ownerId", ownerId).eq("status", "queued"),
      )
      .order("desc")
      .take(ACTIVE_AUTOMATION_BATCH_TASK_LIMIT),
    ctx.db
      .query("automationTaskSummaries")
      .withIndex("by_owner_status", (q) =>
        q.eq("ownerId", ownerId).eq("status", "running"),
      )
      .order("desc")
      .take(ACTIVE_AUTOMATION_BATCH_TASK_LIMIT),
  ]);
  const runIds = getUniqueBatchRunIds([...runningTasks, ...queuedTasks]).slice(
    0,
    limit,
  );
  const jobs = await Promise.all(
    runIds.map(async (runId) => {
      const tasks = await ctx.db
        .query("automationTaskSummaries")
        .withIndex("by_run", (q) => q.eq("runId", runId))
        .take(ACTIVE_AUTOMATION_BATCH_TASK_LIMIT);

      return createActiveAutomationBatchJobSummary(runId, tasks);
    }),
  );

  return jobs
    .filter((job): job is NonNullable<typeof job> => Boolean(job))
    .sort(
      (left, right) =>
        Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
    );
}
