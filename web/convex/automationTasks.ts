import { v } from "convex/values";
import {
  automationMaxActiveTasksPerUser,
  automationMaxTaskAttempts,
} from "./automationLimits";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { automationTaskStatusValidator } from "./validators/automationTaskStatus";
import { automationTaskTypeValidator } from "./validators/automationTaskType";
import { automationToolValidator } from "./validators/automationTool";

async function countActiveTasks(ctx: MutationCtx, ownerId: string) {
  const queued = await ctx.db
    .query("automationTasks")
    .withIndex("by_owner_status", (q) =>
      q.eq("ownerId", ownerId).eq("status", "queued"),
    )
    .take(automationMaxActiveTasksPerUser + 1);
  const running = await ctx.db
    .query("automationTasks")
    .withIndex("by_owner_status", (q) =>
      q.eq("ownerId", ownerId).eq("status", "running"),
    )
    .take(automationMaxActiveTasksPerUser + 1);

  return queued.length + running.length;
}

export const listByRun = query({
  args: {
    runId: v.string(),
  },
  handler: async (ctx, { runId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const run = await ctx.db
      .query("automationRuns")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", runId),
      )
      .unique();

    if (!run) {
      throw new Error("Automation run not found.");
    }

    return await ctx.db
      .query("automationTasks")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .collect();
  },
});

export const create = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    runId: v.string(),
    tool: automationToolValidator,
    taskType: automationTaskTypeValidator,
    stage: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, { secret, ...task }) => {
    assertAutomationWorkerSecret(secret);

    const existing = await ctx.db
      .query("automationTasks")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", task.idempotencyKey),
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    const activeTaskCount = await countActiveTasks(ctx, task.ownerId);

    if (activeTaskCount >= automationMaxActiveTasksPerUser) {
      throw new Error("User has too many queued or running automation tasks.");
    }

    return await ctx.db.insert("automationTasks", {
      ...task,
      status: "queued",
      outputAssetIds: [],
      providerJobIds: [],
      mediaJobIds: [],
      attempt: 0,
      updatedAt: task.createdAt,
    });
  },
});

export const claimNext = mutation({
  args: {
    secret: v.string(),
    workerId: v.string(),
    lockedUntil: v.string(),
    updatedAt: v.string(),
    tool: v.optional(automationToolValidator),
  },
  handler: async (ctx, { secret, workerId, lockedUntil, updatedAt, tool }) => {
    assertAutomationWorkerSecret(secret);

    const queuedTasks = await ctx.db
      .query("automationTasks")
      .withIndex("by_status_created", (q) => q.eq("status", "queued"))
      .order("asc")
      .take(50);
    const task = queuedTasks.find((candidate) =>
      tool ? candidate.tool === tool : true,
    );

    if (!task) {
      return null;
    }

    if (task.attempt >= automationMaxTaskAttempts) {
      await ctx.db.patch(task._id, {
        status: "failed",
        error: "Automation task reached the retry limit.",
        updatedAt,
      });

      return null;
    }

    await ctx.db.patch(task._id, {
      status: "running",
      attempt: task.attempt + 1,
      lockedBy: workerId,
      lockedUntil,
      updatedAt,
    });

    return await ctx.db.get(task._id);
  },
});

export const markStatus = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    status: automationTaskStatusValidator,
    stage: v.optional(v.string()),
    error: v.optional(v.string()),
    outputAssetId: v.optional(v.string()),
    providerJobId: v.optional(v.string()),
    mediaJobId: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      id,
      status,
      stage,
      error,
      outputAssetId,
      providerJobId,
      mediaJobId,
      updatedAt,
    },
  ) => {
    assertAutomationWorkerSecret(secret);

    const task = await ctx.db
      .query("automationTasks")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .filter((q) => q.eq(q.field("id"), id))
      .unique();

    if (!task) {
      throw new Error("Automation task not found.");
    }

    const outputAssetIds =
      outputAssetId && !task.outputAssetIds.includes(outputAssetId)
        ? [...task.outputAssetIds, outputAssetId]
        : task.outputAssetIds;
    const providerJobIds =
      providerJobId && !task.providerJobIds.includes(providerJobId)
        ? [...task.providerJobIds, providerJobId]
        : task.providerJobIds;
    const mediaJobIds =
      mediaJobId && !task.mediaJobIds.includes(mediaJobId)
        ? [...task.mediaJobIds, mediaJobId]
        : task.mediaJobIds;

    await ctx.db.patch(task._id, {
      status,
      ...(stage === undefined ? {} : { stage }),
      outputAssetIds,
      providerJobIds,
      mediaJobIds,
      ...(status === "completed" ? { completedAt: updatedAt } : {}),
      ...(status === "running"
        ? {}
        : { lockedBy: undefined, lockedUntil: undefined }),
      ...(error === undefined ? {} : { error }),
      updatedAt,
    });
  },
});
