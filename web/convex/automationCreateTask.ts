import type { MutationCtx } from "./_generated/server";

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
    runId,
    stage,
    taskType,
    tool,
  }: {
    createdAt: string;
    id: string;
    idempotencyKey: string;
    inputSnapshotJson: string;
    ownerId: string;
    runId: string;
    stage: string;
    taskType: AutomationTaskType;
    tool: AutomationTool;
  },
) {
  const existing = await ctx.db
    .query("automationTasks")
    .withIndex("by_idempotency_key", (q) =>
      q.eq("idempotencyKey", idempotencyKey),
    )
    .unique();

  if (existing) {
    return existing;
  }

  const insertedId = await ctx.db.insert("automationTasks", {
    ownerId,
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
    createdAt,
    updatedAt: createdAt,
  });
  const inserted = await ctx.db.get(insertedId);

  if (!inserted) {
    throw new Error("Failed to create automation task.");
  }

  return inserted;
}
