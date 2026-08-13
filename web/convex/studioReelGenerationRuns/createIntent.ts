import { v } from "convex/values";
import { planStudioStitchBatchReviewSubset } from "../../lib/clipstitchr/studio/stitch/planStudioStitchBatchReviewSubset";
import { mutation } from "../_generated/server";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { assertStudioReelMatchingWriteReceipt } from "../studioReel/assertStudioReelMatchingWriteReceipt";
import { assertStudioReelPositiveInteger } from "../studioReel/assertStudioReelPositiveInteger";
import { buildStudioReelProviderIntents } from "../studioReel/buildStudioReelProviderIntents";
import { consumeStudioReelProviderIntentListRateLimits } from "../studioReel/consumeStudioReelProviderIntentListRateLimits";
import { consumeStudioReelRecordWriteRateLimits } from "../studioReel/consumeStudioReelRecordWriteRateLimits";
import { createStudioReelRequestFingerprint } from "../studioReel/createStudioReelRequestFingerprint";
import { createStudioReelWriteReceipt } from "../studioReel/createStudioReelWriteReceipt";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { getStudioReelRecipesForOwnerProduct } from "../studioReel/getStudioReelRecipesForOwnerProduct";
import { getStudioReelReviewSubsetForOwnerProduct } from "../studioReel/getStudioReelReviewSubsetForOwnerProduct";
import { getStudioReelRunForOwnerProduct } from "../studioReel/getStudioReelRunForOwnerProduct";
import { getStudioReelRunStatusFromIntents } from "../studioReel/getStudioReelRunStatusFromIntents";
import { getStudioReelWriteReceipt } from "../studioReel/getStudioReelWriteReceipt";
import { normalizeStudioReelIdentifierList } from "../studioReel/normalizeStudioReelIdentifierList";
import { normalizeStudioReelProviderReadiness } from "../studioReel/normalizeStudioReelProviderReadiness";
import { parseStudioReelRecipeDocuments } from "../studioReel/parseStudioReelRecipeDocuments";
import { studioReelProviderReadinessValidator } from "../validators/studioReelProviderReadiness";

export const createIntent = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    reviewSubsetId: v.string(),
    recipeIds: v.array(v.string()),
    reviewCount: v.number(),
    providerReadiness: v.array(studioReelProviderReadinessValidator),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    const id = assertStudioReelBoundedString(args.id, {
      label: "Studio Stitch generation run ID",
      maxLength: 120,
    });
    const reviewSubsetId = assertStudioReelBoundedString(args.reviewSubsetId, {
      label: "Studio Stitch review subset ID",
      maxLength: 120,
    });
    const recipeIds = normalizeStudioReelIdentifierList(args.recipeIds, {
      label: "Recipe IDs",
      maximumCount: 100,
    });
    const reviewCount = assertStudioReelPositiveInteger(
      args.reviewCount,
      "Review count",
      recipeIds.length,
    );
    const providerReadiness = normalizeStudioReelProviderReadiness(
      args.providerReadiness,
    );
    const idempotencyKey = assertStudioReelBoundedString(args.idempotencyKey, {
      label: "Idempotency key",
      maxLength: 200,
    });
    const requestFingerprint = await createStudioReelRequestFingerprint(
      JSON.stringify({
        operation: "createRun",
        id,
        productId,
        reviewSubsetId,
        recipeIds,
        reviewCount,
        providerReadiness,
      }),
    );
    const receipt = await getStudioReelWriteReceipt(
      ctx,
      ownerId,
      idempotencyKey,
    );
    if (receipt) {
      assertStudioReelMatchingWriteReceipt(receipt, {
        productId,
        operation: "createRun",
        requestFingerprint,
      });
      const run = await getStudioReelRunForOwnerProduct(
        ctx,
        ownerId,
        productId,
        receipt.targetId,
      );
      if (!run) throw new Error("Idempotent generation run is unavailable.");
      const reviewSubset = run.reviewSubsetId
        ? await getStudioReelReviewSubsetForOwnerProduct(
            ctx,
            ownerId,
            productId,
            run.reviewSubsetId,
          )
        : null;
      if (!reviewSubset) throw new Error("Idempotent review subset is unavailable.");
      return { created: false, run, reviewSubset };
    }
    const [existingRun, existingReviewSubset] = await Promise.all([
      getStudioReelRunForOwnerProduct(ctx, ownerId, productId, id),
      getStudioReelReviewSubsetForOwnerProduct(
        ctx,
        ownerId,
        productId,
        reviewSubsetId,
      ),
    ]);
    if (existingRun || existingReviewSubset) {
      throw new Error("Generation run or review subset ID already exists.");
    }
    const recipeDocuments = await getStudioReelRecipesForOwnerProduct(
      ctx,
      ownerId,
      productId,
      recipeIds,
    );
    const recipes = parseStudioReelRecipeDocuments(recipeDocuments);
    const reviewPlan = planStudioStitchBatchReviewSubset({
      recipes,
      requestedCount: reviewCount,
    });
    const selectedRecipes = reviewPlan.selectedRecipeIds.map((recipeId) => {
      const recipe = recipes.find((candidate) => candidate.id === recipeId);
      if (!recipe) throw new Error("Review planning selected an unknown recipe.");
      return recipe;
    });
    const providerIntents = buildStudioReelProviderIntents(
      selectedRecipes,
      providerReadiness,
    );

    await consumeStudioReelRecordWriteRateLimits(ctx, ownerId);
    await consumeStudioReelProviderIntentListRateLimits(
      ctx,
      ownerId,
      providerIntents,
    );
    const now = new Date().toISOString();
    const runDocumentId = await ctx.db.insert("studioReelGenerationRuns", {
      ownerId,
      id,
      productId,
      kind: "sample",
      reviewSubsetId,
      status: getStudioReelRunStatusFromIntents(providerIntents),
      recordVersion: 1,
      revision: 1,
      recipeIds: [...reviewPlan.selectedRecipeIds],
      requestedCount: reviewPlan.requestedCount,
      providerReadiness,
      providerIntents,
      idempotencyKey,
      attempt: 1,
      createdAt: now,
      updatedAt: now,
    });
    const reviewDocumentId = await ctx.db.insert("studioReelReviewSubsets", {
      ownerId,
      id: reviewSubsetId,
      productId,
      generationRunId: id,
      status: "pending",
      recordVersion: 1,
      revision: 1,
      selectedRecipeIds: [...reviewPlan.selectedRecipeIds],
      remainingRecipeIds: [...reviewPlan.remainingRecipeIds],
      coverageKeys: [...reviewPlan.coverageKeys],
      approvedOutputIds: [],
      createdAt: now,
      updatedAt: now,
    });
    await createStudioReelWriteReceipt(ctx, {
      ownerId,
      productId,
      idempotencyKey,
      operation: "createRun",
      targetId: id,
      requestFingerprint,
      createdAt: now,
    });
    const [run, reviewSubset] = await Promise.all([
      ctx.db.get(runDocumentId),
      ctx.db.get(reviewDocumentId),
    ]);
    if (!run || !reviewSubset) {
      throw new Error("Generation records could not be read after creation.");
    }
    return { created: true, run, reviewSubset };
  },
});
