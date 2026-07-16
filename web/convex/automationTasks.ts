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
import { getAutomationTaskProductId } from "./getAutomationTaskProductId";
import { getIsCliSwiprBatchRunId } from "./cliSwipr/getIsCliSwiprBatchRunId";
import { getIsStitchrBatchRunId } from "./stitchrBatchRunId";
import { markAutomationRunCompletedWhenTasksDone } from "./markAutomationRunCompletedWhenTasksDone";
import { requestWorkerLaunch } from "./workerLaunch";
import { upsertAutomationRunSummary } from "./upsertAutomationRunSummary";
import { upsertAutomationTaskSummary } from "./upsertAutomationTaskSummary";
import { enqueueWorkerQueueEntry } from "./workerQueue/enqueueWorkerQueueEntry";
import { getGenerationRequiredForAutomationTask } from "./workerQueue/getGenerationRequiredForAutomationTask";
import { updateWorkerQueueEntryStatus } from "./workerQueue/updateWorkerQueueEntryStatus";

type AutomationTaskDocument = Doc<"automationTasks">;

const AUTOMATION_TASKS_BY_RUN_SCAN_LIMIT = 200;

async function patchAutomationTaskAndSummary(
  ctx: MutationCtx,
  task: AutomationTaskDocument,
  patch: Partial<AutomationTaskDocument>,
) {
  await ctx.db.patch(task._id, patch);
  const updatedTask = await ctx.db.get(task._id);

  if (updatedTask) {
    await upsertAutomationTaskSummary(ctx, updatedTask);
  }

  return updatedTask;
}

async function countActiveTasks(ctx: MutationCtx, ownerId: string) {
  const queued = await ctx.db
    .query("automationTaskSummaries")
    .withIndex("by_owner_status", (q) =>
      q.eq("ownerId", ownerId).eq("status", "queued"),
    )
    .take(automationMaxActiveTasksPerUser + 1);
  const running = await ctx.db
    .query("automationTaskSummaries")
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
  await patchAutomationTaskAndSummary(ctx, task, {
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
    const updatedRun = await ctx.db.get(run._id);

    if (updatedRun) {
      await upsertAutomationRunSummary(ctx, updatedRun);
    }
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

    const disabledReason =
      getIsStitchrBatchRunId(task.runId) ||
      getIsCliSwiprBatchRunId(task.runId)
      ? null
      : await getAutomationToolDisabledReason(
          ctx,
          task.ownerId,
          task.tool,
          await getAutomationTaskProductId(ctx, task),
        );

    if (disabledReason) {
      await markTaskSkippedForDisabledTool(
        ctx,
        task,
        disabledReason,
        updatedAt,
      );
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
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", runId))
      .unique();

    if (!run) {
      throw new Error("Automation run not found.");
    }

    return await ctx.db
      .query("automationTaskSummaries")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .take(AUTOMATION_TASKS_BY_RUN_SCAN_LIMIT);
  },
});

export const create = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    productId: v.optional(v.string()),
    id: v.string(),
    runId: v.string(),
    tool: automationToolValidator,
    taskType: automationTaskTypeValidator,
    stage: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    usageReservationId: v.optional(v.string()),
    usageReservationIds: v.optional(v.array(v.string())),
    generationSlotId: v.optional(v.string()),
    createdAt: v.string(),
  },
  handler: async (ctx, { secret, ...task }) => {
    assertAutomationWorkerSecret(secret);

    const disabledReason = await getAutomationToolDisabledReason(
      ctx,
      task.ownerId,
      task.tool,
      task.productId,
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
      await upsertAutomationTaskSummary(ctx, existing);

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
      usageReservationId: task.usageReservationId,
      usageReservationIds: task.usageReservationIds,
      generationSlotId: task.generationSlotId,
      updatedAt: task.createdAt,
    });
    const insertedTask = await ctx.db.get(taskId);

    if (insertedTask) {
      await upsertAutomationTaskSummary(ctx, insertedTask);
      await enqueueWorkerQueueEntry(ctx, {
        generationRequired: getGenerationRequiredForAutomationTask(
          insertedTask.taskType,
        ),
        generationSlotId: insertedTask.generationSlotId,
        now: insertedTask.createdAt,
        ownerId: insertedTask.ownerId,
        sourceId: insertedTask.id,
        sourceKind: "automation_task",
        tool: insertedTask.tool,
        usageReservationId: insertedTask.usageReservationId,
        usageReservationIds: insertedTask.usageReservationIds,
        worker: "provider",
      });
    }

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

    const queuedTasks = tool
      ? await ctx.db
          .query("automationTasks")
          .withIndex("by_status_tool_created", (q) =>
            q.eq("status", "queued").eq("tool", tool),
          )
          .order("asc")
          .take(10)
      : await ctx.db
          .query("automationTasks")
          .withIndex("by_status_created", (q) => q.eq("status", "queued"))
          .order("asc")
          .take(10);
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
      await patchAutomationTaskAndSummary(ctx, task, {
        status: "failed",
        error: "Automation task reached the retry limit.",
        updatedAt,
      });

      return null;
    }

    const updatedTask = await patchAutomationTaskAndSummary(ctx, task, {
      status: "running",
      attempt: task.attempt + 1,
      lockedBy: workerId,
      lockedUntil,
      updatedAt,
    });

    return updatedTask;
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
      .withIndex("by_status_tool_stage_created", (q) =>
        q.eq("status", "running").eq("tool", tool).eq("stage", stage),
      )
      .order("asc")
      .take(10);
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

    const updatedTask = await patchAutomationTaskAndSummary(ctx, task, {
      lockedBy: workerId,
      lockedUntil,
      updatedAt,
    });

    return updatedTask;
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

    if (stage && tool) {
      const nowMs = Date.parse(updatedAt);
      const runningTasks = await ctx.db
        .query("automationTasks")
        .withIndex("by_status_tool_stage_created", (q) =>
          q.eq("status", "running").eq("tool", tool).eq("stage", stage),
        )
        .order("asc")
        .take(10);
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

      const updatedTask = await patchAutomationTaskAndSummary(ctx, task, {
        lockedBy: workerId,
        lockedUntil,
        updatedAt,
      });

      return updatedTask;
    }

    const queuedTasks = tool
      ? await ctx.db
          .query("automationTasks")
          .withIndex("by_status_tool_created", (q) =>
            q.eq("status", "queued").eq("tool", tool),
          )
          .order("asc")
          .take(10)
      : await ctx.db
          .query("automationTasks")
          .withIndex("by_status_created", (q) => q.eq("status", "queued"))
          .order("asc")
          .take(10);
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
      await patchAutomationTaskAndSummary(ctx, task, {
        status: "failed",
        error: "Automation task reached the retry limit.",
        updatedAt,
      });

      return null;
    }

    const updatedTask = await patchAutomationTaskAndSummary(ctx, task, {
      status: "running",
      attempt: task.attempt + 1,
      lockedBy: workerId,
      lockedUntil,
      updatedAt,
    });

    return updatedTask;
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
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
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

    await patchAutomationTaskAndSummary(ctx, task, {
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

    await updateWorkerQueueEntryStatus(ctx, {
      error,
      handoff: Boolean(mediaJobId && status === "running" && releaseLock),
      now: updatedAt,
      releaseLock,
      sourceId: id,
      sourceKind: "automation_task",
      status,
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
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
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

    await patchAutomationTaskAndSummary(ctx, task, {
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

    await updateWorkerQueueEntryStatus(ctx, {
      continuationDelayMs:
        status === "running" && releaseLock && stage === "provider-created"
          ? 60_000
          : undefined,
      error,
      handoff: Boolean(mediaJobId && status === "running" && releaseLock),
      now: updatedAt,
      releaseLock,
      sourceId: id,
      sourceKind: "automation_task",
      status,
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
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
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

    await patchAutomationTaskAndSummary(ctx, task, {
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

    await updateWorkerQueueEntryStatus(ctx, {
      error,
      handoff: Boolean(mediaJobId && status === "running" && releaseLock),
      now: updatedAt,
      releaseLock,
      sourceId: id,
      sourceKind: "automation_task",
      status,
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
