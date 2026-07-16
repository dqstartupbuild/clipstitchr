import type { MutationCtx } from "./_generated/server";
import { getAutomationToolDisabledReason } from "./getAutomationToolDisabledReason";
import { upsertAutomationTaskSummary } from "./upsertAutomationTaskSummary";
import { enqueueWorkerQueueEntry } from "./workerQueue/enqueueWorkerQueueEntry";
import { getGenerationRequiredForAutomationTask } from "./workerQueue/getGenerationRequiredForAutomationTask";

type AutomationTaskType =
  | "avatar-photo"
  | "clipr-video"
  | "stitchr-draft"
  | "stitchr-render"
  | "swapr-video"
  | "swipr-draft";
type AutomationTool = "avatar-photo" | "clipr" | "stitchr" | "swapr" | "swipr";

export async function createAutomationTask(
  ctx: MutationCtx,
  {
    createdAt,
    id,
    idempotencyKey,
    inputSnapshotJson,
    ownerId,
    productId,
    runId,
    skipAutomationPreferenceCheck,
    stage,
    taskType,
    tool,
    usageReservationId,
    usageReservationIds,
  }: {
    createdAt: string;
    id: string;
    idempotencyKey: string;
    inputSnapshotJson: string;
    ownerId: string;
    productId?: string;
    runId: string;
    skipAutomationPreferenceCheck?: boolean;
    stage: string;
    taskType: AutomationTaskType;
    tool: AutomationTool;
    usageReservationId?: string;
    usageReservationIds?: string[];
  },
) {
  const disabledReason = await getAutomationToolDisabledReason(
    ctx,
    ownerId,
    tool,
    productId,
    { skipPreferenceCheck: skipAutomationPreferenceCheck },
  );

  if (disabledReason) {
    throw new Error(disabledReason);
  }

  const existing = await ctx.db
    .query("automationTasks")
    .withIndex("by_idempotency_key", (q) =>
      q.eq("idempotencyKey", idempotencyKey),
    )
    .unique();

  if (existing) {
    await upsertAutomationTaskSummary(ctx, existing);

    return existing;
  }

  const insertedId = await ctx.db.insert("automationTasks", {
    ownerId,
    productId,
    id,
    runId,
    tool,
    taskType,
    status: "queued",
    stage,
    idempotencyKey,
    inputSnapshotJson,
    outputAssetIds: [],
    providerJobIds: [],
    mediaJobIds: [],
    attempt: 0,
    usageReservationId,
    usageReservationIds,
    createdAt,
    updatedAt: createdAt,
  });
  const inserted = await ctx.db.get(insertedId);

  if (!inserted) {
    throw new Error("Failed to create automation task.");
  }

  await upsertAutomationTaskSummary(ctx, inserted);
  await enqueueWorkerQueueEntry(ctx, {
    generationRequired: getGenerationRequiredForAutomationTask(
      inserted.taskType,
    ),
    now: inserted.createdAt,
    ownerId: inserted.ownerId,
    sourceId: inserted.id,
    sourceKind: "automation_task",
    tool: inserted.tool,
    usageReservationId: inserted.usageReservationId,
    usageReservationIds: inserted.usageReservationIds,
    worker: "provider",
  });

  return inserted;
}
