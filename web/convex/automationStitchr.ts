import { v } from "convex/values";
import { consumeAutomationBudget } from "./automationBudget";
import { automationDailyLimits } from "./automationLimits";
import {
  selectStitchrPairs,
  type StitchrPairCandidate,
} from "./automationStitchrPairScoring";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { assertMediaWorkerSecret } from "./auth/assertMediaWorkerSecret";
import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { isWithinAutomationGlobalWindow } from "./isWithinAutomationGlobalWindow";

function createRunId(ownerId: string, automationDate: string) {
  return `automation:stitchr:${ownerId}:${automationDate}`;
}

function createTaskId(ownerId: string, automationDate: string, index: number) {
  return `automation:stitchr:${ownerId}:${automationDate}:${index}`;
}

function createDefaultTrimRange(duration: number) {
  return {
    start: 0,
    end: duration,
  };
}

function previousAutomationDate(automationDate: string) {
  const timestamp = Date.parse(`${automationDate}T00:00:00.000Z`);

  if (!Number.isFinite(timestamp)) {
    return "";
  }

  return new Date(timestamp - 86400000).toISOString().slice(0, 10);
}

async function createRun(
  ctx: MutationCtx,
  ownerId: string,
  automationDate: string,
  inputSnapshotJson: string,
  createdAt: string,
) {
  const idempotencyKey = `${ownerId}:${automationDate}:stitchr`;
  const existing = await ctx.db
    .query("automationRuns")
    .withIndex("by_idempotency_key", (q) =>
      q.eq("idempotencyKey", idempotencyKey),
    )
    .unique();

  if (existing) {
    return existing;
  }

  const runId = createRunId(ownerId, automationDate);
  const insertedId = await ctx.db.insert("automationRuns", {
    ownerId,
    id: runId,
    automationDate,
    tool: "stitchr",
    status: "queued",
    idempotencyKey,
    inputSnapshotJson,
    dailyLimit: automationDailyLimits.stitchr,
    attempt: 0,
    createdAt,
    updatedAt: createdAt,
  });
  const inserted = await ctx.db.get(insertedId);

  if (!inserted) {
    throw new Error("Failed to create Stitchr automation run.");
  }

  return inserted;
}

async function markRunSkipped(
  ctx: MutationCtx,
  runDocumentId: Id<"automationRuns">,
  reason: string,
  updatedAt: string,
) {
  await ctx.db.patch(runDocumentId, {
    status: "skipped",
    skippedAt: updatedAt,
    error: reason,
    updatedAt,
  });
}


export const planDaily = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    automationDate: v.string(),
    now: v.string(),
  },
  handler: async (ctx, { secret, ownerId, automationDate, now }) => {
    assertAutomationWorkerSecret(secret);

    if (!isWithinAutomationGlobalWindow(now)) {
      return {
        runId: createRunId(ownerId, automationDate),
        status: "skipped",
        taskIds: [],
      };
    }

    const preferences = await ctx.db
      .query("automationPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();
    const run = await createRun(
      ctx,
      ownerId,
      automationDate,
      JSON.stringify({
        preferenceVersion: preferences?.preferenceVersion ?? 0,
        selectedProductIds: preferences?.selectedProductIds ?? [],
      }),
      now,
    );

    if (run.status !== "queued") {
      return {
        runId: run.id,
        status: run.status,
        taskIds: [],
      };
    }

    if (!preferences?.enabled || !preferences.enabledTools.includes("stitchr")) {
      await markRunSkipped(ctx, run._id, "Stitchr automation is disabled.", now);

      return {
        runId: run.id,
        status: "skipped",
        taskIds: [],
      };
    }

    const clips = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .collect();
    const products = await ctx.db
      .query("products")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
    const ugcClips = clips.filter((clip) => clip.clipType === "ugc");
    const demoClips = clips.filter((clip) => clip.clipType === "demo");

    if (ugcClips.length === 0 || demoClips.length === 0) {
      await markRunSkipped(
        ctx,
        run._id,
        "Stitchr automation needs at least one UGC clip and one Demo clip.",
        now,
      );

      return {
        runId: run.id,
        status: "skipped",
        taskIds: [],
      };
    }

    const selectedProductIds = new Set(preferences.selectedProductIds);
    const productById = new Map(products.map((product) => [product.id, product]));
    const selectedProducts = products.filter((product) =>
      selectedProductIds.has(product.id),
    );
    const eligibleProducts =
      preferences.productSelectionMode === "selected" &&
      selectedProducts.length > 0
        ? selectedProducts
        : products;
    const productFilteredDemos =
      preferences.productSelectionMode === "selected" &&
      selectedProductIds.size > 0
        ? demoClips.filter(
            (demo) => demo.productId && selectedProductIds.has(demo.productId),
          )
        : demoClips;
    const eligibleDemos =
      productFilteredDemos.length > 0 ? productFilteredDemos : demoClips;
    const histories = await ctx.db
      .query("automationPairHistory")
      .withIndex("by_owner_last_used", (q) => q.eq("ownerId", ownerId))
      .collect();
    const historyByPair = new Map(
      histories.map((history) => [
        `${history.ugcClipId}:${history.demoClipId}`,
        history,
      ]),
    );
    const ugcLastUsedAt = new Map<string, string>();
    const demoLastUsedAt = new Map<string, string>();

    for (const history of histories) {
      const currentUgcLastUsedAt = ugcLastUsedAt.get(history.ugcClipId);
      const currentDemoLastUsedAt = demoLastUsedAt.get(history.demoClipId);

      if (!currentUgcLastUsedAt || history.lastUsedAt > currentUgcLastUsedAt) {
        ugcLastUsedAt.set(history.ugcClipId, history.lastUsedAt);
      }

      if (!currentDemoLastUsedAt || history.lastUsedAt > currentDemoLastUsedAt) {
        demoLastUsedAt.set(history.demoClipId, history.lastUsedAt);
      }
    }

    const previousWindowKey = previousAutomationDate(automationDate);
    const candidates: StitchrPairCandidate[] = ugcClips.flatMap((ugc) =>
      eligibleDemos.map((demo) => {
        const history = historyByPair.get(`${ugc.id}:${demo.id}`);

        return {
          ugcClipId: ugc.id,
          demoClipId: demo.id,
          ugcLastUsedAt: ugcLastUsedAt.get(ugc.id),
          demoLastUsedAt: demoLastUsedAt.get(demo.id),
          pairLastUsedAt: history?.lastUsedAt,
          pairUseCount: history?.useCount ?? 0,
          wasUsedInPreviousRun:
            history?.recentUseWindowKey === previousWindowKey,
        };
      }),
    );
    const selectedPairs = selectStitchrPairs(
      candidates,
      automationDailyLimits.stitchr,
      `${ownerId}:${automationDate}:stitchr`,
      Date.parse(now),
    );

    if (selectedPairs.length === 0) {
      await markRunSkipped(
        ctx,
        run._id,
        "Stitchr automation could not find eligible UGC and Demo pairs.",
        now,
      );

      return {
        runId: run.id,
        status: "skipped",
        taskIds: [],
      };
    }

    await consumeAutomationBudget(ctx, {
      ownerId,
      tool: "stitchr",
      count: selectedPairs.length,
    });

    const taskIds: string[] = [];

    for (const [index, selectedPair] of selectedPairs.entries()) {
      const ugc = ugcClips.find(
        (clip) => clip.id === selectedPair.candidate.ugcClipId,
      );
      const demo = eligibleDemos.find(
        (clip) => clip.id === selectedPair.candidate.demoClipId,
      );

      if (!ugc || !demo) {
        continue;
      }

      const taskId = createTaskId(ownerId, automationDate, index + 1);
      const idempotencyKey = `${taskId}:${ugc.id}:${demo.id}`;
      const existingTask = await ctx.db
        .query("automationTasks")
        .withIndex("by_idempotency_key", (q) =>
          q.eq("idempotencyKey", idempotencyKey),
        )
        .unique();

      if (existingTask) {
        taskIds.push(existingTask.id);
        continue;
      }

      const product =
        (demo.productId ? productById.get(demo.productId) : undefined) ??
        eligibleProducts[0];

      await ctx.db.insert("automationTasks", {
        ownerId,
        id: taskId,
        runId: run.id,
        tool: "stitchr",
        taskType: "stitchr-draft",
        status: "queued",
        stage: "awaiting-text-provider",
        idempotencyKey,
        inputSnapshotJson: JSON.stringify({
          automationDate,
          ugcClipId: ugc.id,
          demoClipId: demo.id,
          ugcClipName: ugc.name,
          demoClipName: demo.name,
          ugcDuration: ugc.duration,
          demoDuration: demo.duration,
          ugcHasAudio: ugc.hasAudio,
          demoHasAudio: demo.hasAudio,
          ugcTrimRange: ugc.defaultTrimRange ?? createDefaultTrimRange(ugc.duration),
          demoTrimRange:
            demo.defaultTrimRange ?? createDefaultTrimRange(demo.duration),
          ugcVideoObject: ugc.videoObject,
          demoVideoObject: demo.videoObject,
          productId: product?.id,
          productName: product?.name,
          productDetails: product?.productDetails,
          audienceDetails: product?.audienceDetails,
          inferredProblem: product?.inferredProblem,
          inferredPainPoints: product?.inferredPainPoints ?? [],
          cliprPlaceholderFillers: product?.cliprPlaceholderFillers,
          eligibleCliprHookStyleKeys: product?.eligibleCliprHookStyleKeys,
          eligibleCliprHookTemplateIds: product?.eligibleCliprHookTemplateIds,
          preferredCliprHookStyleKey: product?.preferredCliprHookStyleKey,
          productCreatedAt: product?.createdAt,
          productUpdatedAt: product?.updatedAt,
          selectedScore: selectedPair.score,
        }),
        outputAssetIds: [],
        providerJobIds: [],
        mediaJobIds: [],
        attempt: 0,
        createdAt: now,
        updatedAt: now,
      });
      taskIds.push(taskId);
    }

    await ctx.db.patch(run._id, {
      status: "running",
      startedAt: now,
      updatedAt: now,
    });

    return {
      runId: run.id,
      status: "running",
      taskIds,
    };
  },
});

export const recordOutput = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    taskId: v.string(),
    ugcClipId: v.string(),
    demoClipId: v.string(),
    stitchId: v.string(),
    mediaJobId: v.optional(v.string()),
    automationDate: v.string(),
    completedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      taskId,
      ugcClipId,
      demoClipId,
      stitchId,
      mediaJobId,
      automationDate,
      completedAt,
    },
  ) => {
    assertAutomationWorkerSecret(secret);

    const task = await ctx.db
      .query("automationTasks")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .filter((q) => q.eq(q.field("id"), taskId))
      .unique();

    if (!task) {
      throw new Error("Automation task not found.");
    }

    if (task.status === "completed" && task.outputAssetIds.includes(stitchId)) {
      if (mediaJobId && !task.mediaJobIds.includes(mediaJobId)) {
        await ctx.db.patch(task._id, {
          mediaJobIds: [...task.mediaJobIds, mediaJobId],
          updatedAt: completedAt,
        });
      }

      return;
    }

    const history = await ctx.db
      .query("automationPairHistory")
      .withIndex("by_owner_pair", (q) =>
        q.eq("ownerId", ownerId).eq("ugcClipId", ugcClipId).eq("demoClipId", demoClipId),
      )
      .unique();

    if (history) {
      await ctx.db.patch(history._id, {
        lastUsedAt: completedAt,
        useCount: history.useCount + 1,
        recentUseWindowKey: automationDate,
        lastOutputStitchId: stitchId,
        updatedAt: completedAt,
      });
    } else {
      await ctx.db.insert("automationPairHistory", {
        ownerId,
        ugcClipId,
        demoClipId,
        lastUsedAt: completedAt,
        useCount: 1,
        recentUseWindowKey: automationDate,
        lastOutputStitchId: stitchId,
        createdAt: completedAt,
        updatedAt: completedAt,
      });
    }

    await ctx.db.patch(task._id, {
      status: "completed",
      stage: "completed",
      outputAssetIds: task.outputAssetIds.includes(stitchId)
        ? task.outputAssetIds
        : [...task.outputAssetIds, stitchId],
      mediaJobIds:
        mediaJobId && !task.mediaJobIds.includes(mediaJobId)
          ? [...task.mediaJobIds, mediaJobId]
          : task.mediaJobIds,
      lockedBy: undefined,
      lockedUntil: undefined,
      completedAt,
      updatedAt: completedAt,
    });

    const runTasks = await ctx.db
      .query("automationTasks")
      .withIndex("by_run", (q) => q.eq("runId", task.runId))
      .collect();
    const allTasksCompleted = runTasks.every((runTask) =>
      runTask.id === task.id ? true : runTask.status === "completed",
    );

    if (allTasksCompleted) {
      const run = await ctx.db
        .query("automationRuns")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", task.runId),
        )
        .unique();

      if (run) {
        await ctx.db.patch(run._id, {
          status: "completed",
          completedAt,
          updatedAt: completedAt,
        });
      }
    }
  },
});

export const recordOutputFromMediaWorker = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    taskId: v.string(),
    ugcClipId: v.string(),
    demoClipId: v.string(),
    stitchId: v.string(),
    mediaJobId: v.optional(v.string()),
    automationDate: v.string(),
    completedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      taskId,
      ugcClipId,
      demoClipId,
      stitchId,
      mediaJobId,
      automationDate,
      completedAt,
    },
  ) => {
    assertMediaWorkerSecret(secret);

    const task = await ctx.db
      .query("automationTasks")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .filter((q) => q.eq(q.field("id"), taskId))
      .unique();

    if (!task) {
      throw new Error("Automation task not found.");
    }

    if (task.status === "completed" && task.outputAssetIds.includes(stitchId)) {
      if (mediaJobId && !task.mediaJobIds.includes(mediaJobId)) {
        await ctx.db.patch(task._id, {
          mediaJobIds: [...task.mediaJobIds, mediaJobId],
          updatedAt: completedAt,
        });
      }

      return;
    }

    const history = await ctx.db
      .query("automationPairHistory")
      .withIndex("by_owner_pair", (q) =>
        q.eq("ownerId", ownerId).eq("ugcClipId", ugcClipId).eq("demoClipId", demoClipId),
      )
      .unique();

    if (history) {
      await ctx.db.patch(history._id, {
        lastUsedAt: completedAt,
        useCount: history.useCount + 1,
        recentUseWindowKey: automationDate,
        lastOutputStitchId: stitchId,
        updatedAt: completedAt,
      });
    } else {
      await ctx.db.insert("automationPairHistory", {
        ownerId,
        ugcClipId,
        demoClipId,
        lastUsedAt: completedAt,
        useCount: 1,
        recentUseWindowKey: automationDate,
        lastOutputStitchId: stitchId,
        createdAt: completedAt,
        updatedAt: completedAt,
      });
    }

    await ctx.db.patch(task._id, {
      status: "completed",
      stage: "completed",
      outputAssetIds: task.outputAssetIds.includes(stitchId)
        ? task.outputAssetIds
        : [...task.outputAssetIds, stitchId],
      mediaJobIds:
        mediaJobId && !task.mediaJobIds.includes(mediaJobId)
          ? [...task.mediaJobIds, mediaJobId]
          : task.mediaJobIds,
      lockedBy: undefined,
      lockedUntil: undefined,
      completedAt,
      updatedAt: completedAt,
    });

    const runTasks = await ctx.db
      .query("automationTasks")
      .withIndex("by_run", (q) => q.eq("runId", task.runId))
      .collect();
    const allTasksCompleted = runTasks.every((runTask) =>
      runTask.id === task.id ? true : runTask.status === "completed",
    );

    if (allTasksCompleted) {
      const run = await ctx.db
        .query("automationRuns")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", task.runId),
        )
        .unique();

      if (run) {
        await ctx.db.patch(run._id, {
          status: "completed",
          completedAt,
          updatedAt: completedAt,
        });
      }
    }
  },
});
