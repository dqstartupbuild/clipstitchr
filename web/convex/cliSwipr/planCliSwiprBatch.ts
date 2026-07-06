import { v } from "convex/values";
import { consumeAutomationBudget } from "../automationBudget";
import { createAutomationRun } from "../automationCreateRun";
import { createAutomationTask } from "../automationCreateTask";
import { markAutomationRunStatus } from "../markAutomationRunStatus";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";
import { defaultAutomationGenerationCount } from "../../lib/clipstitchr/constants/defaultAutomationGenerationCount";
import { defaultAutomationStitchrColorChoice } from "../../lib/clipstitchr/constants/defaultAutomationStitchrColorChoice";
import { defaultAutomationStitchrTextStyleChoice } from "../../lib/clipstitchr/constants/defaultAutomationStitchrTextStyleChoice";
import { getAutomationPreferenceForProduct } from "../getAutomationPreferenceForProduct";
import { getAutomationProductScopeKey } from "../getAutomationProductScopeKey";
import { getDefaultProductForOwner } from "../getDefaultProductForOwner";
import { getIsAutomationToolEnabled } from "../../lib/clipstitchr/constants/automationToolFeatureFlags";
import { getProductForOwner } from "../getProductForOwner";
import { getAutomationGenerationCount } from "../../lib/clipstitchr/utils/getAutomationGenerationCount";
import { getAutomationStitchrColorChoice } from "../../lib/clipstitchr/utils/getAutomationStitchrColorChoice";
import { getAutomationStitchrTextStyleChoice } from "../../lib/clipstitchr/utils/getAutomationStitchrTextStyleChoice";
import { getSwiprAutomationCreativeDirection } from "../../lib/clipstitchr/utils/getSwiprAutomationCreativeDirection";
import { normalizeAutomationSwiprSelectedLibraryPackNames } from "../../lib/clipstitchr/utils/normalizeAutomationSwiprSelectedLibraryPackNames";

export const planCliSwiprBatch = mutation({
  args: {
    batchId: v.string(),
    automationDate: v.string(),
    now: v.string(),
    ownerId: v.string(),
    productId: v.optional(v.string()),
    secret: v.string(),
  },
  handler: async (
    ctx,
    { batchId, automationDate, now, ownerId, productId, secret },
  ) => {
    assertRateLimitApiSecret(secret);

    const productScopeKey = getAutomationProductScopeKey(productId);
    const normalizedBatchId = batchId.trim();
    const runId = `cli:swipr:${ownerId}:${productScopeKey}:${automationDate}:${normalizedBatchId}`;

    if (!normalizedBatchId) {
      throw new Error("Swipr batch ID is required.");
    }

    if (!getIsAutomationToolEnabled("swipr")) {
      return { runId, status: "skipped", taskIds: [] };
    }

    const preferences = await getAutomationPreferenceForProduct(
      ctx,
      ownerId,
      productId,
    );
    const product = productId
      ? await getProductForOwner(ctx, ownerId, productId)
      : await getDefaultProductForOwner(ctx, ownerId);

    if (!product) {
      return {
        runId,
        status: "skipped",
        taskIds: [],
        message: "Swipr needs one saved product.",
      };
    }

    const swiprGenerationCount = getAutomationGenerationCount(
      preferences?.swiprGenerationCount ?? defaultAutomationGenerationCount,
    );
    const swiprSelectedLibraryPackNames =
      normalizeAutomationSwiprSelectedLibraryPackNames(
        preferences?.swiprSelectedLibraryPackNames ?? [],
      );
    const swiprTextStyleChoice = getAutomationStitchrTextStyleChoice(
      preferences?.swiprTextStyleChoice ?? defaultAutomationStitchrTextStyleChoice,
    );
    const swiprTextColorChoice = getAutomationStitchrColorChoice(
      preferences?.swiprTextColorChoice ?? defaultAutomationStitchrColorChoice,
    );
    const swiprTextBackgroundColorChoice = getAutomationStitchrColorChoice(
      preferences?.swiprTextBackgroundColorChoice ??
        defaultAutomationStitchrColorChoice,
    );
    const swiprTextStrokeColorChoice = getAutomationStitchrColorChoice(
      preferences?.swiprTextStrokeColorChoice ??
        defaultAutomationStitchrColorChoice,
    );

    await consumeAutomationBudget(ctx, {
      ownerId,
      productId: product.id,
      tool: "swipr",
      count: swiprGenerationCount,
      providerCostUnits: swiprGenerationCount * 5,
    });

    const run = await createAutomationRun(ctx, {
      ownerId,
      id: runId,
      productId: product.id,
      automationDate,
      tool: "swipr",
      idempotencyKey: `${runId}:swipr`,
      inputSnapshotJson: JSON.stringify({
        source: "cli",
        productId: product.id,
        preferenceVersion: preferences?.preferenceVersion ?? 0,
      }),
      createdAt: now,
    });

    if (run.status !== "queued") {
      return { runId, status: run.status, taskIds: [] };
    }

    const taskIds: string[] = [];

    for (let index = 0; index < swiprGenerationCount; index += 1) {
      const task = await createAutomationTask(ctx, {
        ownerId,
        productId: product.id,
        id: `${runId}:${index + 1}`,
        runId,
        tool: "swipr",
        taskType: "swipr-draft",
        stage: "awaiting-text-provider",
        idempotencyKey: `${runId}:swipr:${index + 1}`,
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
          swiprCreativeDirection: getSwiprAutomationCreativeDirection(index + 1),
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
