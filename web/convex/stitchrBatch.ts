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
import { defaultAutomationStitchrColorChoice } from "../lib/clipstitchr/constants/defaultAutomationStitchrColorChoice";
import { defaultAutomationStitchrTextStyleChoice } from "../lib/clipstitchr/constants/defaultAutomationStitchrTextStyleChoice";
import { STITCHR_BATCH_DAILY_LIMIT } from "../lib/clipstitchr/constants/stitchrBatchGenerationLimits";
import { TEXT_OVERLAY_STYLES } from "../lib/clipstitchr/constants/textOverlayStyles";
import { resolveAutomationStitchrColor } from "../lib/clipstitchr/utils/resolveAutomationStitchrColor";
import { resolveAutomationStitchrTextStyleId } from "../lib/clipstitchr/utils/resolveAutomationStitchrTextStyleId";

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
    status: string;
  }>,
) {
  if (tasks.every((task) => task.status === "completed")) {
    return "completed";
  }

  if (tasks.some((task) => task.status === "queued" || task.status === "running")) {
    return "running";
  }

  if (tasks.some((task) => task.status === "failed")) {
    return "failed";
  }

  return "skipped";
}

export const plan = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    batchDate: v.string(),
    now: v.string(),
  },
  handler: async (ctx, { secret, ownerId, batchDate, now }) => {
    assertAutomationWorkerSecret(secret);

    const runId = createStitchrBatchRunId(ownerId, batchDate);
    const existingTasks = await ctx.db
      .query("automationTasks")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .collect();

    if (existingTasks.length > 0) {
      const status = getExistingRunStatus(existingTasks);

      return {
        runId,
        status,
        taskIds: [],
        message: `Today's Stitchr batch is already ${status}.`,
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
      key: ownerId,
      count: selectedPairs.length,
      throws: true,
    });
    await rateLimiter.limit(ctx, "stitchrBatchGlobalDaily", {
      count: selectedPairs.length,
      throws: true,
    });

    const taskIds: string[] = [];
    const stitchrTextStyleChoice = defaultAutomationStitchrTextStyleChoice;
    const stitchrTextColorChoice = defaultAutomationStitchrColorChoice;
    const stitchrTextBackgroundColorChoice =
      defaultAutomationStitchrColorChoice;

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
      const stitchrTextStyleId = resolveAutomationStitchrTextStyleId(
        stitchrTextStyleChoice,
        `${ownerId}:${batchDate}:stitchr-batch:${index + 1}:${ugc.id}:${demo.id}`,
      );
      const stitchrTextStyle = TEXT_OVERLAY_STYLES.find(
        (style) => style.id === stitchrTextStyleId,
      );
      const stitchrTextColor = resolveAutomationStitchrColor(
        stitchrTextColorChoice,
        `${ownerId}:${batchDate}:stitchr-batch:${index + 1}:${ugc.id}:${demo.id}:text`,
      );
      const stitchrTextBackgroundColor = stitchrTextStyle?.backgroundColor
        ? resolveAutomationStitchrColor(
            stitchrTextBackgroundColorChoice,
            `${ownerId}:${batchDate}:stitchr-batch:${index + 1}:${ugc.id}:${demo.id}:background`,
          )
        : undefined;
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
          productCreatedAt: product?.createdAt,
          productUpdatedAt: product?.updatedAt,
          selectedScore: selectedPair.score,
          stitchrTextStyleChoice,
          stitchrTextStyleId,
          stitchrTextColorChoice,
          stitchrTextColor,
          stitchrTextBackgroundColorChoice,
          stitchrTextBackgroundColor,
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
    };
  },
});
