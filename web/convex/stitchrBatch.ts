import { v } from "convex/values";
import {
  selectStitchrPairs,
  type StitchrPairCandidate,
} from "./automationStitchrPairScoring";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { mutation } from "./_generated/server";
import { getDefaultProductForOwner } from "./getDefaultProductForOwner";
import { createQuickEditSuggestionsFromMetadata } from "./createQuickEditSuggestionsFromMetadata";
import { getQuickEditOverlayText } from "./getQuickEditOverlayText";
import { rateLimiter } from "./rateLimiter";
import { requestWorkerLaunch } from "./workerLaunch";
import { createStitchrBatchRunId } from "./stitchrBatchRunId";
import { getStitchTemplateBatchTextOverlay } from "./stitchTemplates/getStitchTemplateBatchTextOverlay";
import { defaultAutomationStitchrColorChoice } from "../lib/clipstitchr/constants/defaultAutomationStitchrColorChoice";
import { defaultAutomationStitchrTextStyleChoice } from "../lib/clipstitchr/constants/defaultAutomationStitchrTextStyleChoice";
import { STITCHR_BATCH_DAILY_LIMIT } from "../lib/clipstitchr/constants/stitchrBatchGenerationLimits";
import { TEXT_OVERLAY_STYLES } from "../lib/clipstitchr/constants/textOverlayStyles";
import { getStitchrBatchRateLimitKey } from "../lib/clipstitchr/server/stitchr/getStitchrBatchRateLimitKey";
import { getAutomationStitchrColorChoice } from "../lib/clipstitchr/utils/getAutomationStitchrColorChoice";
import { getAutomationStitchrTextStyleChoice } from "../lib/clipstitchr/utils/getAutomationStitchrTextStyleChoice";
import { resolveAutomationStitchrColor } from "../lib/clipstitchr/utils/resolveAutomationStitchrColor";
import { resolveAutomationStitchrTextStyleId } from "../lib/clipstitchr/utils/resolveAutomationStitchrTextStyleId";
import { automationStitchrTextStyleChoiceValidator } from "./validators/automationStitchrTextStyleChoice";

function createTaskId(ownerId: string, batchDate: string, index: number) {
  return `stitchr-batch:${ownerId}:${batchDate}:${index}`;
}

function createDefaultTrimRange(duration: number) {
  return {
    start: 0,
    end: duration,
  };
}

function previousBatchDate(batchDate: string) {
  const timestamp = Date.parse(`${batchDate}T00:00:00.000Z`);

  if (!Number.isFinite(timestamp)) {
    return "";
  }

  return new Date(timestamp - 86400000).toISOString().slice(0, 10);
}

function getExistingRunStatus(
  tasks: Array<{
    outputAssetIds: string[];
    status: string;
  }>,
) {
  if (
    tasks.every(
      (task) => task.status === "completed" && task.outputAssetIds.length > 0,
    )
  ) {
    return "completed";
  }

  if (
    tasks.some(
      (task) =>
        task.status === "queued" ||
        task.status === "running" ||
        (task.status === "completed" && task.outputAssetIds.length === 0),
    )
  ) {
    return "running";
  }

  if (tasks.some((task) => task.status === "failed")) {
    return "failed";
  }

  return "skipped";
}

function getStitchrBatchTaskNeedsProviderLaunch(task: {
  outputAssetIds: string[];
  stage: string;
  status: string;
}) {
  return (
    task.status === "queued" ||
    (task.status === "running" && task.stage === "awaiting-text-provider") ||
    (task.status === "completed" && task.outputAssetIds.length === 0)
  );
}

function getStitchrBatchTaskNeedsMediaLaunch(task: {
  stage: string;
  status: string;
}) {
  return task.status === "running" && task.stage === "awaiting-media-worker";
}

function getStitchrBatchTaskNeedsHookPlanning(task: {
  outputAssetIds: string[];
  stage: string;
  status: string;
}) {
  return (
    task.status === "queued" ||
    (task.status === "running" && task.stage === "awaiting-text-provider") ||
    (task.status === "completed" && task.outputAssetIds.length === 0)
  );
}

function getStitchrBatchTaskIsActive(task: {
  outputAssetIds: string[];
  status: string;
}) {
  return (
    task.status === "queued" ||
    task.status === "running" ||
    (task.status === "completed" && task.outputAssetIds.length === 0)
  );
}

export const plan = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    batchDate: v.string(),
    now: v.string(),
    stitchrTextBackgroundColorChoice: v.optional(v.string()),
    stitchrTextColorChoice: v.optional(v.string()),
    stitchrTextStrokeColorChoice: v.optional(v.string()),
    stitchrTextStyleChoice: v.optional(automationStitchrTextStyleChoiceValidator),
    templateId: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      batchDate,
      now,
      stitchrTextBackgroundColorChoice,
      stitchrTextColorChoice,
      stitchrTextStrokeColorChoice,
      stitchrTextStyleChoice,
      templateId,
    },
  ) => {
    assertAutomationWorkerSecret(secret);

    const runId = createStitchrBatchRunId(ownerId, batchDate);
    const existingTasks = await ctx.db
      .query("automationTasks")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .collect();

    if (existingTasks.length > 0) {
      const status = getExistingRunStatus(existingTasks);
      const activeTaskIds = existingTasks
        .filter(getStitchrBatchTaskIsActive)
        .map((task) => task.id);
      const hookPlanningTaskIds = existingTasks
        .filter(getStitchrBatchTaskNeedsHookPlanning)
        .map((task) => task.id);
      const shouldLaunchProvider = existingTasks.some(
        getStitchrBatchTaskNeedsProviderLaunch,
      );
      const shouldLaunchMedia = existingTasks.some(
        getStitchrBatchTaskNeedsMediaLaunch,
      );

      await Promise.all(
        existingTasks
          .filter(
            (task) =>
              task.status === "completed" && task.outputAssetIds.length === 0,
          )
          .map((task) =>
            ctx.db.patch(task._id, {
              status: "queued",
              stage: "awaiting-text-provider",
              lockedBy: undefined,
              lockedUntil: undefined,
              completedAt: undefined,
              error: undefined,
              updatedAt: now,
            }),
          ),
      );

      if (shouldLaunchProvider) {
        await requestWorkerLaunch({
          ctx,
          now,
          worker: "provider",
        });
      }

      if (shouldLaunchMedia) {
        await requestWorkerLaunch({
          ctx,
          now,
          worker: "media",
        });
      }

      return {
        runId,
        status,
        taskIds: status === "running" ? activeTaskIds : [],
        hookPlanningTaskIds: status === "running" ? hookPlanningTaskIds : [],
        message:
          status === "running"
            ? "Today's Stitchr batch is already running, so I nudged it to keep going."
            : `Today's Stitchr batch is already ${status}.`,
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
    const defaultProduct = await getDefaultProductForOwner(ctx, ownerId);
    const batchTemplate = templateId
      ? await ctx.db
          .query("stitchTemplates")
          .withIndex("by_owner_id", (q) =>
            q.eq("ownerId", ownerId).eq("id", templateId),
          )
          .unique()
      : null;

    if (templateId && !batchTemplate) {
      throw new Error("Unable to find that Stitch template.");
    }

    const templateTextOverlay = batchTemplate
      ? getStitchTemplateBatchTextOverlay(batchTemplate)
      : undefined;
    const templateSocialCaption =
      batchTemplate?.socialCaption?.trim() || undefined;
    const ugcClips = clips.filter((clip) => clip.clipType === "ugc");
    const demoClips = clips.filter((clip) => clip.clipType === "demo");

    if (ugcClips.length === 0 || demoClips.length === 0) {
      return {
        runId,
        status: "skipped",
        taskIds: [],
        message: "Stitchr Batch needs at least one UGC clip and one Demo clip.",
      };
    }

    const productById = new Map(products.map((product) => [product.id, product]));
    const histories = await ctx.db
      .query("stitchrBatchPairHistory")
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

    const previousWindowKey = previousBatchDate(batchDate);
    const candidates: StitchrPairCandidate[] = ugcClips.flatMap((ugc) =>
      demoClips.map((demo) => {
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
      STITCHR_BATCH_DAILY_LIMIT,
      `${ownerId}:${batchDate}:stitchr-batch`,
      Date.parse(now),
    );

    if (selectedPairs.length === 0) {
      return {
        runId,
        status: "skipped",
        taskIds: [],
        message: "Stitchr Batch could not find eligible UGC and Demo pairs.",
      };
    }

    await rateLimiter.limit(ctx, "stitchrBatchDaily", {
      key: getStitchrBatchRateLimitKey(ownerId, batchDate),
      count: selectedPairs.length,
      throws: true,
    });
    await rateLimiter.limit(ctx, "stitchrBatchGlobalDaily", {
      count: selectedPairs.length,
      throws: true,
    });

    const taskIds: string[] = [];
    const selectedStitchrTextStyleChoice =
      templateTextOverlay?.styleId ??
      getAutomationStitchrTextStyleChoice(
        stitchrTextStyleChoice ?? defaultAutomationStitchrTextStyleChoice,
      );
    const selectedStitchrTextColorChoice = getAutomationStitchrColorChoice(
      stitchrTextColorChoice ?? defaultAutomationStitchrColorChoice,
    );
    const selectedStitchrTextBackgroundColorChoice =
      getAutomationStitchrColorChoice(
        stitchrTextBackgroundColorChoice ?? defaultAutomationStitchrColorChoice,
      );
    const selectedStitchrTextStrokeColorChoice =
      getAutomationStitchrColorChoice(
        stitchrTextStrokeColorChoice ?? defaultAutomationStitchrColorChoice,
      );

    for (const [index, selectedPair] of selectedPairs.entries()) {
      const ugc = ugcClips.find(
        (clip) => clip.id === selectedPair.candidate.ugcClipId,
      );
      const demo = demoClips.find(
        (clip) => clip.id === selectedPair.candidate.demoClipId,
      );

      if (!ugc || !demo) {
        continue;
      }

      const taskId = createTaskId(ownerId, batchDate, index + 1);
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
        defaultProduct ??
        products[0];
      const stitchrTextStyleId =
        templateTextOverlay?.styleId ??
        resolveAutomationStitchrTextStyleId(
          selectedStitchrTextStyleChoice,
          `${ownerId}:${batchDate}:stitchr-batch:${index + 1}:${ugc.id}:${demo.id}`,
        );
      const stitchrTextStyle = TEXT_OVERLAY_STYLES.find(
        (style) => style.id === stitchrTextStyleId,
      );
      const stitchrTextColor =
        templateTextOverlay?.color ??
        resolveAutomationStitchrColor(
          selectedStitchrTextColorChoice,
          `${ownerId}:${batchDate}:stitchr-batch:${index + 1}:${ugc.id}:${demo.id}:text`,
        );
      const stitchrTextBackgroundColor =
        templateTextOverlay?.backgroundColor ??
        (stitchrTextStyle?.backgroundColor
          ? resolveAutomationStitchrColor(
              selectedStitchrTextBackgroundColorChoice,
              `${ownerId}:${batchDate}:stitchr-batch:${index + 1}:${ugc.id}:${demo.id}:background`,
            )
          : undefined);
      const stitchrTextStrokeColor =
        templateTextOverlay?.strokeColor ??
        (stitchrTextStyle?.strokeColor
          ? resolveAutomationStitchrColor(
              selectedStitchrTextStrokeColorChoice,
              `${ownerId}:${batchDate}:stitchr-batch:${index + 1}:${ugc.id}:${demo.id}:stroke`,
            )
          : undefined);
      const ugcQuickEdit = createQuickEditSuggestionsFromMetadata(ugc.quickEdit);
      const demoQuickEdit = createQuickEditSuggestionsFromMetadata(demo.quickEdit);
      const ugcOverlayText = getQuickEditOverlayText({
        performanceScore: ugc.performanceScore,
        quickEdit: ugc.quickEdit,
      });
      const demoOverlayText = getQuickEditOverlayText({
        performanceScore: demo.performanceScore,
        quickEdit: demo.quickEdit,
      });

      await ctx.db.insert("automationTasks", {
        ownerId,
        id: taskId,
        runId,
        tool: "stitchr",
        taskType: "stitchr-draft",
        status: "queued",
        stage: "awaiting-text-provider",
        idempotencyKey,
        inputSnapshotJson: JSON.stringify({
          automationDate: batchDate,
          ugcClipId: ugc.id,
          demoClipId: demo.id,
          ugcClipName: ugc.name,
          demoClipName: demo.name,
          ugcLibraryKind: ugc.libraryKind,
          demoLibraryKind: demo.libraryKind,
          ugcTags: ugc.tags ?? [],
          demoTags: demo.tags ?? [],
          ugcVideoDescription: ugc.videoDescription,
          demoVideoDescription: demo.videoDescription,
          ugcMainPersonDescription: ugc.mainPersonDescription,
          demoMainPersonDescription: demo.mainPersonDescription,
          ugcOutfitDescription: ugc.outfitDescription,
          demoOutfitDescription: demo.outfitDescription,
          ugcLocationDescription: ugc.locationDescription,
          demoLocationDescription: demo.locationDescription,
          ugcPoseDescription: ugc.poseDescription,
          demoPoseDescription: demo.poseDescription,
          ugcProductDescription: ugc.productDescription,
          demoProductDescription: demo.productDescription,
          ugcQuickEdit,
          demoQuickEdit,
          ugcQuickEditOverlayTextHint: ugcOverlayText?.replaceWith,
          demoQuickEditOverlayTextHint: demoOverlayText?.replaceWith,
          ugcQuickEditOverlayTextReason: ugcOverlayText?.reason,
          demoQuickEditOverlayTextReason: demoOverlayText?.reason,
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
          emotionalNarrative: product?.emotionalNarrative,
          inferredProblem: product?.inferredProblem,
          inferredPainPoints: product?.inferredPainPoints ?? [],
          cliprPlaceholderFillers: product?.cliprPlaceholderFillers,
          eligibleCliprHookStyleKeys: product?.eligibleCliprHookStyleKeys,
          eligibleCliprHookTemplateIds: product?.eligibleCliprHookTemplateIds,
          preferredCliprHookStyleKey: product?.preferredCliprHookStyleKey,
          winningHookExamples: product?.winningHookExamples,
          rejectedHookExamples: product?.rejectedHookExamples,
          hookGenerationGoal: product?.hookGenerationGoal,
          hookEdgeLevel: product?.hookEdgeLevel,
          productCreatedAt: product?.createdAt,
          productUpdatedAt: product?.updatedAt,
          selectedScore: selectedPair.score,
          templateId: batchTemplate?.id,
          templateName: batchTemplate?.name,
          templateTextOverlay,
          templateSocialCaption,
          stitchrTextStyleChoice: selectedStitchrTextStyleChoice,
          stitchrTextStyleId,
          stitchrTextColorChoice: selectedStitchrTextColorChoice,
          stitchrTextColor,
          stitchrTextBackgroundColorChoice:
            selectedStitchrTextBackgroundColorChoice,
          stitchrTextBackgroundColor,
          stitchrTextStrokeColorChoice: selectedStitchrTextStrokeColorChoice,
          stitchrTextStrokeColor,
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

    if (taskIds.length > 0) {
      await requestWorkerLaunch({
        ctx,
        now,
        worker: "provider",
      });
    }

    return {
      runId,
      status: "running",
      taskIds,
      hookPlanningTaskIds: taskIds,
    };
  },
});
