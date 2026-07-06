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
import { getDefaultProductForOwner } from "./getDefaultProductForOwner";
import { getProductForOwner } from "./getProductForOwner";
import { getAutomationPreferenceForProduct } from "./getAutomationPreferenceForProduct";
import { getAutomationProductScopeKey } from "./getAutomationProductScopeKey";
import { createQuickEditSuggestionsFromMetadata } from "./createQuickEditSuggestionsFromMetadata";
import { getQuickEditOverlayText } from "./getQuickEditOverlayText";
import { createCompletedRunNotification } from "./createCompletedRunNotification";
import { createAutomaticStitchTemplateFromAcceptedHookStitch } from "./stitchTemplates/createAutomaticStitchTemplateFromAcceptedHookStitch";
import { getStitchTemplateBatchTextOverlay } from "./stitchTemplates/getStitchTemplateBatchTextOverlay";
import { defaultAutomationGenerationCount } from "../lib/clipstitchr/constants/defaultAutomationGenerationCount";
import { defaultAutomationStitchrColorChoice } from "../lib/clipstitchr/constants/defaultAutomationStitchrColorChoice";
import { defaultAutomationStitchrTextStyleChoice } from "../lib/clipstitchr/constants/defaultAutomationStitchrTextStyleChoice";
import { getIsAutomationToolEnabled } from "../lib/clipstitchr/constants/automationToolFeatureFlags";
import { TEXT_OVERLAY_STYLES } from "../lib/clipstitchr/constants/textOverlayStyles";
import { getAutomationGenerationCount } from "../lib/clipstitchr/utils/getAutomationGenerationCount";
import { getAutomationStitchrColorChoice } from "../lib/clipstitchr/utils/getAutomationStitchrColorChoice";
import { getAutomationStitchrTextStyleChoice } from "../lib/clipstitchr/utils/getAutomationStitchrTextStyleChoice";
import { normalizeAutomationStitchrTemplateAllocations } from "../lib/clipstitchr/utils/normalizeAutomationStitchrTemplateAllocations";
import { resolveAutomationStitchrColor } from "../lib/clipstitchr/utils/resolveAutomationStitchrColor";
import { resolveAutomationStitchrTextStyleId } from "../lib/clipstitchr/utils/resolveAutomationStitchrTextStyleId";
import { isWithinAutomationGlobalWindow } from "./isWithinAutomationGlobalWindow";
import { recordStitchrBatchPairHistory } from "./recordStitchrBatchPairHistory";
import { getIsStitchrBatchRunId } from "./stitchrBatchRunId";
import { markAutomationRunStatus } from "./markAutomationRunStatus";
import { listProductsForOwnerByIds } from "./listProductsForOwnerByIds";
import { listRecentVideoClipsByLibraryKind } from "./listRecentVideoClipsByLibraryKind";
import { requestWorkerLaunch } from "./workerLaunch";
import { upsertAutomationRunSummary } from "./upsertAutomationRunSummary";
import { upsertAutomationTaskSummary } from "./upsertAutomationTaskSummary";

const AUTOMATION_STITCHR_COMPLETION_TASK_SCAN_LIMIT =
  automationDailyLimits.stitchr + 20;
const AUTOMATION_STITCHR_HISTORY_SCAN_LIMIT = 1000;
const AUTOMATION_STITCHR_SELECTED_PRODUCT_LOOKUP_LIMIT = 20;
const AUTOMATION_STITCHR_SOURCE_CLIP_SCAN_LIMIT = 240;
const AUTOMATION_STITCHR_TEMPLATE_LOOKUP_LIMIT = 20;

function createRunId(
  ownerId: string,
  automationDate: string,
  productId?: string,
) {
  return `automation:stitchr:${ownerId}:${getAutomationProductScopeKey(
    productId,
  )}:${automationDate}`;
}

function createTaskId(
  ownerId: string,
  automationDate: string,
  index: number,
  productId?: string,
) {
  return `automation:stitchr:${ownerId}:${getAutomationProductScopeKey(
    productId,
  )}:${automationDate}:${index}`;
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
  productId?: string,
) {
  const productScopeKey = getAutomationProductScopeKey(productId);
  const idempotencyKey = `${ownerId}:${productScopeKey}:${automationDate}:stitchr`;
  const existing = await ctx.db
    .query("automationRuns")
    .withIndex("by_idempotency_key", (q) =>
      q.eq("idempotencyKey", idempotencyKey),
    )
    .unique();

  if (existing) {
    await upsertAutomationRunSummary(ctx, existing);

    return existing;
  }

  const runId = createRunId(ownerId, automationDate, productId);
  const insertedId = await ctx.db.insert("automationRuns", {
    ownerId,
    productId,
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

  await upsertAutomationRunSummary(ctx, inserted);

  return inserted;
}

async function markRunSkipped(
  ctx: MutationCtx,
  runDocumentId: Id<"automationRuns">,
  reason: string,
  updatedAt: string,
) {
  await markAutomationRunStatus(ctx, {
    runDocumentId,
    status: "skipped",
    error: reason,
    updatedAt,
  });
}

export const planDaily = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    productId: v.optional(v.string()),
    automationDate: v.string(),
    now: v.string(),
  },
  handler: async (ctx, { secret, ownerId, productId, automationDate, now }) => {
    assertAutomationWorkerSecret(secret);
    const productScopeKey = getAutomationProductScopeKey(productId);

    if (!isWithinAutomationGlobalWindow(now)) {
      return {
        runId: createRunId(ownerId, automationDate, productId),
        status: "skipped",
        taskIds: [],
        message: "Stitchr automation is outside the daily generation window.",
      };
    }

    const preferences = await getAutomationPreferenceForProduct(
      ctx,
      ownerId,
      productId,
    );

    if (!getIsAutomationToolEnabled("stitchr")) {
      return {
        runId: createRunId(ownerId, automationDate, productId),
        status: "skipped",
        taskIds: [],
        message: "Stitchr automation is turned off right now.",
      };
    }

    if (
      !preferences?.enabled ||
      !preferences.enabledTools.includes("stitchr")
    ) {
      return {
        runId: createRunId(ownerId, automationDate, productId),
        status: "skipped",
        taskIds: [],
        message: "Turn on Stitchr automation in Settings first.",
      };
    }

    const stitchrTextStyleChoice = preferences
      ? getAutomationStitchrTextStyleChoice(preferences.stitchrTextStyleChoice)
      : defaultAutomationStitchrTextStyleChoice;
    const stitchrTextColorChoice = preferences
      ? getAutomationStitchrColorChoice(preferences.stitchrTextColorChoice)
      : defaultAutomationStitchrColorChoice;
    const stitchrTextBackgroundColorChoice = preferences
      ? getAutomationStitchrColorChoice(
          preferences.stitchrTextBackgroundColorChoice,
        )
      : defaultAutomationStitchrColorChoice;
    const stitchrTextStrokeColorChoice = preferences
      ? getAutomationStitchrColorChoice(
          preferences.stitchrTextStrokeColorChoice,
        )
      : defaultAutomationStitchrColorChoice;
    const stitchrGenerationCount = getAutomationGenerationCount(
      preferences?.stitchrGenerationCount ?? defaultAutomationGenerationCount,
    );
    const stitchrTemplateAllocations =
      normalizeAutomationStitchrTemplateAllocations(
        preferences?.stitchrTemplateAllocations,
        stitchrGenerationCount,
      );
    const run = await createRun(
      ctx,
      ownerId,
      automationDate,
      JSON.stringify({
        preferenceVersion: preferences?.preferenceVersion ?? 0,
        productId,
        selectedProductIds: preferences?.selectedProductIds ?? [],
        stitchrGenerationCount,
        stitchrTextStyleChoice,
        stitchrTextColorChoice,
        stitchrTextBackgroundColorChoice,
        stitchrTextStrokeColorChoice,
        stitchrTemplateAllocations,
      }),
      now,
      productId,
    );

    if (run.status !== "queued") {
      return {
        runId: run.id,
        status: run.status,
        taskIds: [],
        message: `Today's Stitchr batch is already ${run.status}.`,
      };
    }

    const [allUgcClips, allDemoClips, defaultProduct] = await Promise.all([
      listRecentVideoClipsByLibraryKind(ctx, {
        libraryKind: "ugc",
        limit: AUTOMATION_STITCHR_SOURCE_CLIP_SCAN_LIMIT,
        ownerId,
        productId,
      }),
      listRecentVideoClipsByLibraryKind(ctx, {
        libraryKind: "demo",
        limit: AUTOMATION_STITCHR_SOURCE_CLIP_SCAN_LIMIT,
        ownerId,
        productId,
      }),
      getDefaultProductForOwner(ctx, ownerId),
    ]);
    const ugcClips = productId
      ? allUgcClips.filter((clip) => clip.productId === productId)
      : allUgcClips.filter((clip) => Boolean(clip.productId));
    const demoClips = productId
      ? allDemoClips.filter((clip) => clip.productId === productId)
      : allDemoClips;

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
        message:
          "Stitchr automation needs at least one UGC clip and one Demo clip.",
      };
    }

    const selectedProductIds = new Set(
      productId ? [productId] : preferences.selectedProductIds,
    );
    const explicitProduct = productId
      ? await getProductForOwner(ctx, ownerId, productId)
      : null;
    const selectedProducts =
      !productId && preferences.productSelectionMode === "selected"
        ? await listProductsForOwnerByIds(
            ctx,
            ownerId,
            [...selectedProductIds],
            AUTOMATION_STITCHR_SELECTED_PRODUCT_LOOKUP_LIMIT,
          )
        : [];
    const defaultProducts = defaultProduct ? [defaultProduct] : [];
    const eligibleProducts =
      productId && explicitProduct
        ? [explicitProduct]
        : preferences.productSelectionMode === "selected" &&
            selectedProducts.length > 0
          ? selectedProducts
          : defaultProducts.length > 0
            ? defaultProducts
            : [];
    const productById = new Map(
      eligibleProducts.map((product) => [product.id, product]),
    );
    const defaultProductIds =
      productId || preferences.productSelectionMode === "selected"
        ? new Set<string>()
        : new Set(defaultProduct ? [defaultProduct.id] : []);
    const demoProductFilterIds =
      (productId || preferences.productSelectionMode === "selected") &&
      selectedProductIds.size > 0
        ? selectedProductIds
        : defaultProductIds;
    const productFilteredDemos =
      demoProductFilterIds.size > 0
        ? demoClips.filter(
            (demo) =>
              demo.productId && demoProductFilterIds.has(demo.productId),
          )
        : demoClips;
    const eligibleDemos =
      productFilteredDemos.length > 0
        ? productFilteredDemos
        : defaultProductIds.size > 0
          ? []
          : demoClips;
    const histories = await ctx.db
      .query("automationPairHistory")
      .withIndex("by_owner_last_used", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(AUTOMATION_STITCHR_HISTORY_SCAN_LIMIT);
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

      if (
        !currentDemoLastUsedAt ||
        history.lastUsedAt > currentDemoLastUsedAt
      ) {
        demoLastUsedAt.set(history.demoClipId, history.lastUsedAt);
      }
    }

    const previousWindowKey = previousAutomationDate(automationDate);
    const candidates: StitchrPairCandidate[] = ugcClips.flatMap((ugc) =>
      eligibleDemos
        .filter((demo) => ugc.productId && ugc.productId === demo.productId)
        .map((demo) => {
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
      Math.min(stitchrGenerationCount, automationDailyLimits.stitchr),
      `${ownerId}:${productScopeKey}:${automationDate}:stitchr`,
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
        message:
          "Stitchr automation could not find eligible UGC and Demo pairs.",
      };
    }

    await consumeAutomationBudget(ctx, {
      ownerId,
      productId,
      tool: "stitchr",
      count: selectedPairs.length,
    });

    const taskIds: string[] = [];
    const allocatedTemplateIds = new Set(
      stitchrTemplateAllocations.map((allocation) => allocation.templateId),
    );
    const stitchTemplates = [];

    for (const templateId of [...allocatedTemplateIds].slice(
      0,
      AUTOMATION_STITCHR_TEMPLATE_LOOKUP_LIMIT,
    )) {
      const template = await ctx.db
        .query("stitchTemplates")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", templateId),
        )
        .unique();

      if (template) {
        stitchTemplates.push(template);
      }
    }
    const stitchTemplateById = new Map(
      stitchTemplates.map((template) => [template.id, template]),
    );
    const stitchTemplatePlan = stitchrTemplateAllocations.flatMap(
      (allocation) => {
        const template = stitchTemplateById.get(allocation.templateId);

        return template
          ? Array.from({ length: allocation.count }, () => template)
          : [];
      },
    );

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

      const taskId = createTaskId(
        ownerId,
        automationDate,
        index + 1,
        productId,
      );
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
      const stitchTemplate = stitchTemplatePlan[index];
      const templateTextOverlay = stitchTemplate
        ? getStitchTemplateBatchTextOverlay(stitchTemplate)
        : undefined;
      const templateSocialCaption =
        stitchTemplate?.socialCaption?.trim() || undefined;
      const stitchrTextStyleId =
        templateTextOverlay?.styleId ??
        resolveAutomationStitchrTextStyleId(
          stitchrTextStyleChoice,
          `${ownerId}:${productScopeKey}:${automationDate}:stitchr:${index + 1}:${ugc.id}:${demo.id}`,
        );
      const stitchrTextStyle = TEXT_OVERLAY_STYLES.find(
        (style) => style.id === stitchrTextStyleId,
      );
      const stitchrTextColor =
        templateTextOverlay?.color ??
        resolveAutomationStitchrColor(
          stitchrTextColorChoice,
          `${ownerId}:${productScopeKey}:${automationDate}:stitchr:${index + 1}:${ugc.id}:${demo.id}:text`,
        );
      const stitchrTextBackgroundColor =
        templateTextOverlay?.backgroundColor ??
        (stitchrTextStyle?.backgroundColor
          ? resolveAutomationStitchrColor(
              stitchrTextBackgroundColorChoice,
              `${ownerId}:${productScopeKey}:${automationDate}:stitchr:${index + 1}:${ugc.id}:${demo.id}:background`,
            )
          : undefined);
      const stitchrTextStrokeColor =
        templateTextOverlay?.strokeColor ??
        (stitchrTextStyle?.strokeColor
          ? resolveAutomationStitchrColor(
              stitchrTextStrokeColorChoice,
              `${ownerId}:${productScopeKey}:${automationDate}:stitchr:${index + 1}:${ugc.id}:${demo.id}:stroke`,
            )
          : undefined);
      const ugcQuickEdit = createQuickEditSuggestionsFromMetadata(
        ugc.quickEdit,
      );
      const demoQuickEdit = createQuickEditSuggestionsFromMetadata(
        demo.quickEdit,
      );
      const ugcOverlayText = getQuickEditOverlayText({
        quickEdit: ugc.quickEdit,
      });
      const demoOverlayText = getQuickEditOverlayText({
        quickEdit: demo.quickEdit,
      });

      const insertedTaskId = await ctx.db.insert("automationTasks", {
        ownerId,
        productId,
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
          ugcTrimRange:
            ugc.defaultTrimRange ?? createDefaultTrimRange(ugc.duration),
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
          templateId: stitchTemplate?.id,
          templateName: stitchTemplate?.name,
          templateTextOverlay,
          templateSocialCaption,
          stitchrTextStyleChoice,
          stitchrTextStyleId,
          stitchrTextColorChoice,
          stitchrTextColor,
          stitchrTextBackgroundColorChoice,
          stitchrTextBackgroundColor,
          stitchrTextStrokeColorChoice,
          stitchrTextStrokeColor,
        }),
        outputAssetIds: [],
        providerJobIds: [],
        mediaJobIds: [],
        attempt: 0,
        createdAt: now,
        updatedAt: now,
      });
      const insertedTask = await ctx.db.get(insertedTaskId);

      if (insertedTask) {
        await upsertAutomationTaskSummary(ctx, insertedTask);
      }

      taskIds.push(taskId);
    }

    await markAutomationRunStatus(ctx, {
      runDocumentId: run._id,
      status: "running",
      updatedAt: now,
    });

    if (taskIds.length > 0) {
      await requestWorkerLaunch({
        ctx,
        now,
        worker: "provider",
      });
    }

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
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", taskId),
      )
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
        const updatedTask = await ctx.db.get(task._id);

        if (updatedTask) {
          await upsertAutomationTaskSummary(ctx, updatedTask);
        }
      }

      return;
    }

    const isStitchrBatchOutput = getIsStitchrBatchRunId(task.runId);

    if (isStitchrBatchOutput) {
      await recordStitchrBatchPairHistory(ctx, {
        ownerId,
        ugcClipId,
        demoClipId,
        stitchId,
        batchDate: automationDate,
        completedAt,
      });
    } else {
      const history = await ctx.db
        .query("automationPairHistory")
        .withIndex("by_owner_pair", (q) =>
          q
            .eq("ownerId", ownerId)
            .eq("ugcClipId", ugcClipId)
            .eq("demoClipId", demoClipId),
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
    const updatedTask = await ctx.db.get(task._id);

    if (updatedTask) {
      await upsertAutomationTaskSummary(ctx, updatedTask);
    }

    await createAutomaticStitchTemplateFromAcceptedHookStitch({
      ctx,
      ownerId,
      stitchId,
      updatedAt: completedAt,
    }).catch(() => null);

    const runTasks = await ctx.db
      .query("automationTaskSummaries")
      .withIndex("by_run", (q) => q.eq("runId", task.runId))
      .take(AUTOMATION_STITCHR_COMPLETION_TASK_SCAN_LIMIT);
    const allTasksCompleted = runTasks.every((runTask) =>
      runTask.id === task.id ? true : runTask.status === "completed",
    );

    if (allTasksCompleted && isStitchrBatchOutput) {
      await createCompletedRunNotification(ctx, {
        automationDate,
        completedAt,
        ownerId,
        runId: task.runId,
        sourceType: "stitchr-batch",
        tool: "stitchr",
      });
    }

    if (allTasksCompleted && !isStitchrBatchOutput) {
      const run = await ctx.db
        .query("automationRuns")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", task.runId),
        )
        .unique();

      if (run) {
        await markAutomationRunStatus(ctx, {
          runDocumentId: run._id,
          status: "completed",
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
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", taskId),
      )
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
        const updatedTask = await ctx.db.get(task._id);

        if (updatedTask) {
          await upsertAutomationTaskSummary(ctx, updatedTask);
        }
      }

      return;
    }

    const isStitchrBatchOutput = getIsStitchrBatchRunId(task.runId);

    if (isStitchrBatchOutput) {
      await recordStitchrBatchPairHistory(ctx, {
        ownerId,
        ugcClipId,
        demoClipId,
        stitchId,
        batchDate: automationDate,
        completedAt,
      });
    } else {
      const history = await ctx.db
        .query("automationPairHistory")
        .withIndex("by_owner_pair", (q) =>
          q
            .eq("ownerId", ownerId)
            .eq("ugcClipId", ugcClipId)
            .eq("demoClipId", demoClipId),
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
    const updatedTask = await ctx.db.get(task._id);

    if (updatedTask) {
      await upsertAutomationTaskSummary(ctx, updatedTask);
    }

    await createAutomaticStitchTemplateFromAcceptedHookStitch({
      ctx,
      ownerId,
      stitchId,
      updatedAt: completedAt,
    }).catch(() => null);

    const runTasks = await ctx.db
      .query("automationTaskSummaries")
      .withIndex("by_run", (q) => q.eq("runId", task.runId))
      .take(AUTOMATION_STITCHR_COMPLETION_TASK_SCAN_LIMIT);
    const allTasksCompleted = runTasks.every((runTask) =>
      runTask.id === task.id ? true : runTask.status === "completed",
    );

    if (allTasksCompleted && isStitchrBatchOutput) {
      await createCompletedRunNotification(ctx, {
        automationDate,
        completedAt,
        ownerId,
        runId: task.runId,
        sourceType: "stitchr-batch",
        tool: "stitchr",
      });
    }

    if (allTasksCompleted && !isStitchrBatchOutput) {
      const run = await ctx.db
        .query("automationRuns")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", task.runId),
        )
        .unique();

      if (run) {
        await markAutomationRunStatus(ctx, {
          runDocumentId: run._id,
          status: "completed",
          updatedAt: completedAt,
        });
      }
    }
  },
});
