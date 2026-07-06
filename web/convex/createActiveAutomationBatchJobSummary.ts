import { getAutomationBatchJobProgress } from "./getAutomationBatchJobProgress";
import { getAutomationBatchJobStage } from "./getAutomationBatchJobStage";
import { getAutomationBatchJobStatus } from "./getAutomationBatchJobStatus";
import { getAutomationBatchJobType } from "./getAutomationBatchJobType";
import type { Doc } from "./_generated/dataModel";

type AutomationTaskSummary = Doc<"automationTaskSummaries">;

function getEarliestTimestamp(tasks: AutomationTaskSummary[]) {
  return tasks
    .map((task) => task.createdAt)
    .sort((left, right) => Date.parse(left) - Date.parse(right))[0];
}

function getLatestTimestamp(tasks: AutomationTaskSummary[]) {
  return tasks
    .map((task) => task.updatedAt)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0];
}

export function createActiveAutomationBatchJobSummary(
  runId: string,
  tasks: AutomationTaskSummary[],
) {
  const jobType = getAutomationBatchJobType(runId);

  if (!jobType || tasks.length === 0) {
    return null;
  }

  return {
    id: runId,
    jobType,
    status: getAutomationBatchJobStatus(tasks),
    stage: getAutomationBatchJobStage(tasks),
    progress: getAutomationBatchJobProgress(tasks),
    outputAssetIds: tasks.flatMap((task) => task.outputAssetIds),
    providerJobIds: tasks.flatMap((task) => task.providerJobIds),
    mediaJobIds: tasks.flatMap((task) => task.mediaJobIds),
    error: tasks.find((task) => task.error)?.error,
    createdAt: getEarliestTimestamp(tasks) ?? tasks[0].createdAt,
    updatedAt: getLatestTimestamp(tasks) ?? tasks[0].updatedAt,
  };
}
