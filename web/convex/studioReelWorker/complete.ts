import { v } from "convex/values";
import type { StudioReelWorkerDurableOutput } from "../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerDurableOutput";
import { parseStudioStitchRecipe } from "../../lib/clipstitchr/studio/stitch/parseStudioStitchRecipe";
import { mutation } from "../_generated/server";
import { consumeStudioReelWorkerWriteRateLimits } from "../studioReelRateLimits/consumeStudioReelWorkerWriteRateLimits";
import { assertStudioReelWorkerLease } from "./assertStudioReelWorkerLease";
import { assertStudioReelWorkerSecret } from "./assertStudioReelWorkerSecret";
import { createStudioReelWorkerOutputId } from "./createStudioReelWorkerOutputId";
import { getStudioReelWorkerRun } from "./getStudioReelWorkerRun";
import { getStudioReelWorkerScopeState } from "./getStudioReelWorkerScopeState";
import { normalizeStudioReelWorkerDurableOutput } from "./normalizeStudioReelWorkerDurableOutput";

const outputValidator = v.object({
  recipeId: v.string(),
  objectKey: v.string(),
  objectVersion: v.string(),
  contentType: v.literal("video/mp4"),
  sizeBytes: v.number(),
  sha256: v.string(),
  durationSeconds: v.number(),
  width: v.number(),
  height: v.number(),
  hasAudio: v.boolean(),
  videoCodec: v.string(),
  audioCodec: v.optional(v.string()),
});

export const complete = mutation({
  args: {
    leaseAttempt: v.number(),
    leaseId: v.string(),
    outputs: v.array(outputValidator),
    ownerId: v.string(),
    productId: v.string(),
    runAttempt: v.number(),
    runId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioReelWorkerSecret(args.secret);
    const candidate = await getStudioReelWorkerRun(ctx, args);
    if (candidate?.status === "completed") {
      if (candidate.attempt !== args.runAttempt) {
        throw new Error("Studio Stitch completion attempt does not match.");
      }
      const outputs = await ctx.db
        .query("studioReelOutputs")
        .withIndex("by_owner_product_run_created", (query) =>
          query
            .eq("ownerId", candidate.ownerId)
            .eq("productId", candidate.productId)
            .eq("generationRunId", candidate.id),
        )
        .order("asc")
        .collect();
      return { completed: false, outputs };
    }
    const run = assertStudioReelWorkerLease(candidate, args);
    if (
      run.status !== "intentReady" ||
      run.cancelRequestedAt ||
      args.outputs.length !== run.recipeIds.length ||
      new Set(args.outputs.map((output) => output.recipeId)).size !==
        args.outputs.length ||
      run.recipeIds.some(
        (recipeId) => !args.outputs.some((output) => output.recipeId === recipeId),
      )
    ) {
      throw new Error("Studio Stitch completion does not cover the leased run.");
    }
    const scope = await getStudioReelWorkerScopeState(
      ctx,
      run.ownerId,
      run.productId,
    );
    if (
      scope.execution.state === "unavailable" ||
      !scope.studioAccess ||
      !scope.productOwned
    ) {
      throw new Error("Studio Stitch execution access was revoked.");
    }
    const recipeDocuments = await Promise.all(
      run.recipeIds.map((recipeId) =>
        ctx.db
          .query("studioReelRecipes")
          .withIndex("by_owner_product_id", (query) =>
            query
              .eq("ownerId", run.ownerId)
              .eq("productId", run.productId)
              .eq("id", recipeId),
          )
          .unique(),
      ),
    );
    if (recipeDocuments.some((document) => !document)) {
      throw new Error("Studio Stitch completion recipe is missing.");
    }
    const normalized = run.recipeIds.map((recipeId, index) => {
      const document = recipeDocuments[index];
      if (!document || document.status !== "active") {
        throw new Error("Studio Stitch completion recipe is inactive.");
      }
      const recipe = parseStudioStitchRecipe(document.recipeJson);
      if (
        recipe.id !== recipeId ||
        recipe.productId !== run.productId ||
        recipe.pipeline !== document.pipeline
      ) {
        throw new Error("Studio Stitch completion recipe scope is invalid.");
      }
      const output = args.outputs.find(
        (candidateOutput) => candidateOutput.recipeId === recipeId,
      ) as StudioReelWorkerDurableOutput | undefined;
      if (!output) throw new Error("Studio Stitch completion output is missing.");
      return normalizeStudioReelWorkerDurableOutput(output, {
        ownerId: run.ownerId,
        productId: run.productId,
        runId: run.id,
        recipeId,
        pipeline: recipe.pipeline,
        durationSeconds: recipe.durationSeconds,
      });
    });
    const existingOutputs = await ctx.db
      .query("studioReelOutputs")
      .withIndex("by_owner_product_run_created", (query) =>
        query
          .eq("ownerId", run.ownerId)
          .eq("productId", run.productId)
          .eq("generationRunId", run.id),
      )
      .collect();
    if (existingOutputs.length !== 0) {
      throw new Error("Studio Stitch run already has output records.");
    }
    await consumeStudioReelWorkerWriteRateLimits(ctx, run.ownerId);
    const now = new Date().toISOString();
    const createdIds = [];
    for (const output of normalized) {
      const id = await createStudioReelWorkerOutputId(run.id, output.recipeId);
      await ctx.db.insert("studioReelOutputs", {
        ownerId: run.ownerId,
        id,
        productId: run.productId,
        generationRunId: run.id,
        recipeId: output.recipeId,
        status: "generated",
        recordVersion: 1,
        revision: 1,
        objectKey: output.objectKey,
        objectVersion: output.objectVersion,
        contentType: output.contentType,
        byteLength: output.sizeBytes,
        sha256: output.sha256,
        durationSeconds: output.durationSeconds,
        width: output.width,
        height: output.height,
        hasAudio: output.hasAudio,
        videoCodec: output.videoCodec,
        ...(output.audioCodec ? { audioCodec: output.audioCodec } : {}),
        idempotencyKey: `worker_complete_${run.id}_${run.attempt}_${output.recipeId}`,
        createdAt: now,
        updatedAt: now,
      });
      createdIds.push(id);
    }
    await ctx.db.patch(run._id, {
      completedAt: now,
      executionCheckpoint: "completed",
      executionCode: "completed",
      executionProgressPercent: 100,
      revision: run.revision + 1,
      status: "completed",
      updatedAt: now,
      workerLeaseExpiresAt: undefined,
      workerLeaseId: undefined,
      workerLeaseWorkerId: undefined,
    });
    const created = [];
    for (const id of createdIds) {
      const output = await ctx.db
        .query("studioReelOutputs")
        .withIndex("by_owner_product_id", (query) =>
          query
            .eq("ownerId", run.ownerId)
            .eq("productId", run.productId)
            .eq("id", id),
        )
        .unique();
      if (output) created.push(output);
    }
    return { completed: true, outputs: created };
  },
});
