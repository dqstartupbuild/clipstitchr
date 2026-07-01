import type { Doc } from "./_generated/dataModel";

export function createAutomationTaskSummaryFields(task: Doc<"automationTasks">) {
  return {
    ownerId: task.ownerId,
    productId: task.productId,
    id: task.id,
    runId: task.runId,
    tool: task.tool,
    taskType: task.taskType,
    status: task.status,
    stage: task.stage,
    outputAssetIds: task.outputAssetIds,
    providerJobIds: task.providerJobIds,
    mediaJobIds: task.mediaJobIds,
    attempt: task.attempt,
    error: task.error,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    completedAt: task.completedAt,
  };
}
