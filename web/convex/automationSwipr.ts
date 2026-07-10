import { v } from "convex/values";
import { consumeAutomationBudget } from "./automationBudget";
import { createAutomationRun } from "./automationCreateRun";
import { createAutomationTask } from "./automationCreateTask";
import { markAutomationRunSkipped } from "./automationMarkRunSkipped";
import { markAutomationRunStatus } from "./markAutomationRunStatus";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { mutation } from "./_generated/server";
import { defaultAutomationGenerationCount } from "../lib/clipstitchr/constants/defaultAutomationGenerationCount";
import { defaultAutomationStitchrColorChoice } from "../lib/clipstitchr/constants/defaultAutomationStitchrColorChoice";
import { defaultAutomationStitchrTextStyleChoice } from "../lib/clipstitchr/constants/defaultAutomationStitchrTextStyleChoice";
import { getDefaultProductForOwner } from "./getDefaultProductForOwner";
import { getAutomationPreferenceForProduct } from "./getAutomationPreferenceForProduct";
import { getAutomationProductScopeKey } from "./getAutomationProductScopeKey";
import { getProductForOwner } from "./getProductForOwner";
import { listProductsForOwnerByIds } from "./listProductsForOwnerByIds";
import { getIsAutomationToolEnabled } from "../lib/clipstitchr/constants/automationToolFeatureFlags";
import { getAutomationGenerationCount } from "../lib/clipstitchr/utils/getAutomationGenerationCount";
import { getAutomationStitchrColorChoice } from "../lib/clipstitchr/utils/getAutomationStitchrColorChoice";
import { getAutomationStitchrTextStyleChoice } from "../lib/clipstitchr/utils/getAutomationStitchrTextStyleChoice";
import { normalizeAutomationSwiprSelectedLibraryPackNames } from "../lib/clipstitchr/utils/normalizeAutomationSwiprSelectedLibraryPackNames";
import { isWithinAutomationGlobalWindow } from "./isWithinAutomationGlobalWindow";

const AUTOMATION_SWIPR_SELECTED_PRODUCT_LOOKUP_LIMIT = 20;

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
    const runId = `automation:swipr:${ownerId}:${productScopeKey}:${automationDate}`;

    if (!isWithinAutomationGlobalWindow(now)) {
      return { runId, status: "skipped", taskIds: [] };
    }

    if (!getIsAutomationToolEnabled("swipr")) {
      return { runId, status: "skipped", taskIds: [] };
    }

    const preferences = await getAutomationPreferenceForProduct(
      ctx,
      ownerId,
      productId,
    );

    if (!preferences?.enabled || !preferences.enabledTools.includes("swipr")) {
      return { runId, status: "skipped", taskIds: [] };
    }

    const run = await createAutomationRun(ctx, {
      ownerId,
      id: runId,
      productId,
      automationDate,
      tool: "swipr",
      idempotencyKey: `${ownerId}:${productScopeKey}:${automationDate}:swipr`,
      inputSnapshotJson: JSON.stringify({
        preferenceVersion: preferences?.preferenceVersion ?? 0,
        productId,
      }),
      createdAt: now,
    });

    if (run.status !== "queued") {
      return { runId, status: run.status, taskIds: [] };
    }

    const selectedProductIds = new Set(
      productId ? [productId] : preferences.selectedProductIds,
    );
    const defaultProduct = await getDefaultProductForOwner(ctx, ownerId);
    const selectedProducts =
      !productId && preferences.productSelectionMode === "selected"
        ? await listProductsForOwnerByIds(
            ctx,
            ownerId,
            [...selectedProductIds],
            AUTOMATION_SWIPR_SELECTED_PRODUCT_LOOKUP_LIMIT,
          )
        : [];
    const product = productId
      ? await getProductForOwner(ctx, ownerId, productId)
      : preferences.productSelectionMode === "selected"
        ? selectedProducts[0]
        : defaultProduct;
    if (!product) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Swipr automation needs one saved product.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }

    const swiprGenerationCount = getAutomationGenerationCount(
      preferences.swiprGenerationCount ?? defaultAutomationGenerationCount,
    );
    const swiprSelectedLibraryPackNames =
      normalizeAutomationSwiprSelectedLibraryPackNames(
        preferences.swiprSelectedLibraryPackNames ?? [],
      );
    const swiprTextStyleChoice = getAutomationStitchrTextStyleChoice(
      preferences.swiprTextStyleChoice ??
        defaultAutomationStitchrTextStyleChoice,
    );
    const swiprTextColorChoice = getAutomationStitchrColorChoice(
      preferences.swiprTextColorChoice ?? defaultAutomationStitchrColorChoice,
    );
    const swiprTextBackgroundColorChoice = getAutomationStitchrColorChoice(
      preferences.swiprTextBackgroundColorChoice ??
        defaultAutomationStitchrColorChoice,
    );
    const swiprTextStrokeColorChoice = getAutomationStitchrColorChoice(
      preferences.swiprTextStrokeColorChoice ??
        defaultAutomationStitchrColorChoice,
    );

    await consumeAutomationBudget(ctx, {
      ownerId,
      productId,
      tool: "swipr",
      count: swiprGenerationCount,
      providerCostUnits: swiprGenerationCount * 5,
    });

    const taskIds: string[] = [];

    for (let index = 0; index < swiprGenerationCount; index += 1) {
      const task = await createAutomationTask(ctx, {
        ownerId,
        productId,
        id: `${runId}:${index + 1}`,
        runId,
        tool: "swipr",
        taskType: "swipr-draft",
        stage: "awaiting-text-provider",
        idempotencyKey: `${ownerId}:${productScopeKey}:${automationDate}:swipr:${
          index + 1
        }`,
        inputSnapshotJson: JSON.stringify({
          automationDate,
          draftIndex: index + 1,
          productId: product.id,
          productName: product.name,
          productDetails: product.productDetails,
          audienceDetails: product.audienceDetails,
          emotionalNarrative: product.emotionalNarrative,
          cliprPlaceholderFillers: product.cliprPlaceholderFillers,
          eligibleCliprHookStyleKeys: product.eligibleCliprHookStyleKeys,
          eligibleCliprHookTemplateIds: product.eligibleCliprHookTemplateIds,
          inferredProblem: product.inferredProblem,
          inferredPainPoints: product.inferredPainPoints,
          preferredCliprHookStyleKey: product.preferredCliprHookStyleKey,
          winningHookExamples: product.winningHookExamples,
          rejectedHookExamples: product.rejectedHookExamples,
          hookGenerationGoal: product.hookGenerationGoal,
          hookEdgeLevel: product.hookEdgeLevel,
          productCreatedAt: product.createdAt,
          productUpdatedAt: product.updatedAt,
          swiprSelectedLibraryPackNames,
          swiprTextStyleChoice,
          swiprTextColorChoice,
          swiprTextBackgroundColorChoice,
          swiprTextStrokeColorChoice,
        }),
        createdAt: now,
      });

      taskIds.push(task.id);
    }

    await markAutomationRunStatus(ctx, {
      runDocumentId: run._id,
      status: "running",
      updatedAt: now,
    });

    return { runId, status: "running", taskIds };
  },
});
