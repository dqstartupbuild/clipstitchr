import type { Doc } from "./_generated/dataModel";

export function createAutomationRunSummaryFields(run: Doc<"automationRuns">) {
  return {
    ownerId: run.ownerId,
    productId: run.productId,
    id: run.id,
    automationDate: run.automationDate,
    tool: run.tool,
    status: run.status,
    dailyLimit: run.dailyLimit,
    attempt: run.attempt,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    skippedAt: run.skippedAt,
    failedAt: run.failedAt,
    error: run.error,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
  };
}
