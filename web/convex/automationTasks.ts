import { v } from "convex/values";
import {
  automationMaxActiveTasksPerUser,
  automationMaxTaskAttempts,
} from "./automationLimits";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { assertMediaWorkerSecret } from "./auth/assertMediaWorkerSecret";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { automationTaskStatusValidator } from "./validators/automationTaskStatus";
import { automationTaskTypeValidator } from "./validators/automationTaskType";
import { automationToolValidator } from "./validators/automationTool";
import { getAutomationToolDisabledReason } from "./getAutomationToolDisabledReason";
import { getIsStitchrBatchRunId } from "./stitchrBatchRunId";
import { markAutomationRunCompletedWhenTasksDone } from "./markAutomationRunCompletedWhenTasksDone";
import { requestWorkerLaunch } from "./workerLaunch";

type AutomationTaskDocument = Doc<"automationTasks">;

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

async function markTaskSkippedForDisabledTool(
  ctx: MutationCtx,
  task: AutomationTaskDocument,
  reason: string,
  updatedAt: string,
) {
  await ctx.db.patch(task._id, {
    status: "skipped",
    stage: "disabled",
    error: reason,
    lockedBy: undefined,
    lockedUntil: undefined,
    updatedAt,
  });

  const run = await ctx.db
    .query("automationRuns")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", task.ownerId).eq("id", task.runId),
    )
    .unique();

  if (run && (run.status === "queued" || run.status === "running")) {
    await ctx.db.patch(run._id, {
      status: "skipped",
      skippedAt: updatedAt,
      error: reason,
      updatedAt,
    });
  }
}

async function getClaimableTask(
  ctx: MutationCtx,
  tasks: AutomationTaskDocument[],
  matchesTask: (task: AutomationTaskDocument) => boolean,
  updatedAt: string,
) {
  for (const task of tasks) {
    if (!matchesTask(task)) {
      continue;
    }

    const disabledReason = getIsStitchrBatchRunId(task.runId)
      ? null
      : await getAutomationToolDisabledReason(ctx, task.ownerId, task.tool);

    if (disabledReason) {
      await markTaskSkippedForDisabledTool(ctx, task, disabledReason, updatedAt);
      continue;
    }

    return task;
  }

  return null;
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

    const disabledReason = await getAutomationToolDisabledReason(
      ctx,
      task.ownerId,
      task.tool,
    );

    if (disabledReason) {
      return null;
    }

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

    const taskId = await ctx.db.insert("automationTasks", {
      ...task,
      status: "queued",
      outputAssetIds: [],
      providerJobIds: [],
      mediaJobIds: [],
      attempt: 0,
      updatedAt: task.createdAt,
    });

    await requestWorkerLaunch({
      ctx,
      now: task.createdAt,
      worker: "provider",
    });

    return taskId;
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
    const task = await getClaimableTask(
      ctx,
      queuedTasks,
      (candidate) => (tool ? candidate.tool === tool : true),
      updatedAt,
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

export const claimNextByStage = mutation({
  args: {
    secret: v.string(),
    workerId: v.string(),
    lockedUntil: v.string(),
    updatedAt: v.string(),
    tool: automationToolValidator,
    stage: v.string(),
  },
  handler: async (
    ctx,
    { secret, workerId, lockedUntil, updatedAt, tool, stage },
  ) => {
    assertAutomationWorkerSecret(secret);

    const nowMs = Date.parse(updatedAt);
    const runningTasks = await ctx.db
      .query("automationTasks")
      .withIndex("by_status_created", (q) => q.eq("status", "running"))
      .order("asc")
      .take(50);
    const task = await getClaimableTask(
      ctx,
      runningTasks,
      (candidate) => {
        const lockedUntilMs = candidate.lockedUntil
          ? Date.parse(candidate.lockedUntil)
          : 0;

        return (
          candidate.tool === tool &&
          candidate.stage === stage &&
          (!candidate.lockedUntil ||
            !Number.isFinite(lockedUntilMs) ||
            lockedUntilMs <= nowMs)
        );
      },
      updatedAt,
    );

    if (!task) {
      return null;
    }

    await ctx.db.patch(task._id, {
      lockedBy: workerId,
      lockedUntil,
      updatedAt,
    });

    return await ctx.db.get(task._id);
  },
});

export const claimNextForProvider = mutation({
  args: {
    secret: v.string(),
    workerId: v.string(),
    lockedUntil: v.string(),
    updatedAt: v.string(),
    tool: v.optional(automationToolValidator),
    stage: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { secret, workerId, lockedUntil, updatedAt, tool, stage },
  ) => {
    assertProviderWorkerSecret(secret);

    const matchesTask = (candidate: { stage: string; tool: string }) =>
      (!tool || candidate.tool === tool) &&
      (!stage || candidate.stage === stage);

    if (stage) {
      const nowMs = Date.parse(updatedAt);
      const runningTasks = await ctx.db
        .query("automationTasks")
        .withIndex("by_status_created", (q) => q.eq("status", "running"))
        .order("asc")
        .take(50);
      const task = await getClaimableTask(
        ctx,
        runningTasks,
        (candidate) => {
          const lockedUntilMs = candidate.lockedUntil
            ? Date.parse(candidate.lockedUntil)
            : 0;

          return (
            matchesTask(candidate) &&
            (!candidate.lockedUntil ||
              !Number.isFinite(lockedUntilMs) ||
              lockedUntilMs <= nowMs)
          );
        },
        updatedAt,
      );

      if (!task) {
        return null;
      }

      await ctx.db.patch(task._id, {
        lockedBy: workerId,
        lockedUntil,
        updatedAt,
      });

      return await ctx.db.get(task._id);
    }

    const queuedTasks = await ctx.db
      .query("automationTasks")
      .withIndex("by_status_created", (q) => q.eq("status", "queued"))
      .order("asc")
      .take(50);
    const task = await getClaimableTask(
      ctx,
      queuedTasks,
      matchesTask,
      updatedAt,
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
    releaseLock: v.optional(v.boolean()),
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
      releaseLock,
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
      ...(status === "running" && !releaseLock
        ? {}
        : { lockedBy: undefined, lockedUntil: undefined }),
      ...(error === undefined ? {} : { error }),
      updatedAt,
    });

    if (status === "completed") {
      await markAutomationRunCompletedWhenTasksDone(ctx, {
        completedTaskId: task.id,
        ownerId,
        runId: task.runId,
        updatedAt,
      });
    }
  },
});

export const markProviderStatus = mutation({
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
    releaseLock: v.optional(v.boolean()),
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
      releaseLock,
      updatedAt,
    },
  ) => {
    assertProviderWorkerSecret(secret);

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
      ...(status === "running" && !releaseLock
        ? {}
        : { lockedBy: undefined, lockedUntil: undefined }),
      ...(error === undefined ? {} : { error }),
      updatedAt,
    });

    if (status === "completed") {
      await markAutomationRunCompletedWhenTasksDone(ctx, {
        completedTaskId: task.id,
        ownerId,
        runId: task.runId,
        updatedAt,
      });
    }

    if (status === "queued") {
      await requestWorkerLaunch({
        ctx,
        now: updatedAt,
        worker: "provider",
      });
    }

    if (status === "running" && releaseLock && stage === "provider-created") {
      await requestWorkerLaunch({
        ctx,
        delayMs: 60_000,
        now: updatedAt,
        worker: "provider",
      });
    }
  },
});

export const markMediaStatus = mutation({
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
    releaseLock: v.optional(v.boolean()),
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
      releaseLock,
      updatedAt,
    },
  ) => {
    assertMediaWorkerSecret(secret);

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
      ...(status === "running" && !releaseLock
        ? {}
        : { lockedBy: undefined, lockedUntil: undefined }),
      ...(error === undefined ? {} : { error }),
      updatedAt,
    });

    if (status === "completed") {
      await markAutomationRunCompletedWhenTasksDone(ctx, {
        completedTaskId: task.id,
        ownerId,
        runId: task.runId,
        updatedAt,
      });
    }
  },
});
