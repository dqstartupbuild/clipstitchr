import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { mutation } from "../_generated/server";
import { upsertWorkerJobSummary } from "../upsertWorkerJobSummary";
import { recalculateHookLabIdeaUse } from "./recalculateHookLabIdeaUse";

export const failGenerationJobFromProvider = mutation({
  args: {
    failureCode: v.string(),
    failureMessage: v.string(),
    jobId: v.string(),
    ownerId: v.string(),
    secret: v.string(),
    updatedAt: v.string(),
    variantId: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);
    const [job, variant] = await Promise.all([
      ctx.db
        .query("providerJobs")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.jobId),
        )
        .unique(),
      ctx.db
        .query("hookLabIdeaVariants")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.variantId),
        )
        .unique(),
    ]);

    if (!job || job.jobType !== "hook-lab-idea-use") {
      throw new Error("Hook Lab generation job not found.");
    }

    if (job.status === "completed" || job.status === "canceled") {
      return { jobStatus: job.status, variantStatus: variant?.status };
    }

    if (variant?.status === "completed") {
      const outputAssetIds =
        variant.finishedStitchId &&
        !job.outputAssetIds.includes(variant.finishedStitchId)
          ? [...job.outputAssetIds, variant.finishedStitchId]
          : job.outputAssetIds;

      await ctx.db.patch(job._id, {
        completedAt: variant.completedAt ?? args.updatedAt,
        error: undefined,
        lockedBy: undefined,
        lockedUntil: undefined,
        outputAssetIds,
        progress: 1,
        stage: "completed",
        status: "completed",
        updatedAt: args.updatedAt,
      });
    } else {
      const failureCode = args.failureCode.trim().slice(0, 100);
      const failureMessage = args.failureMessage.trim().slice(0, 300);

      await ctx.db.patch(job._id, {
        error: failureMessage,
        lockedBy: undefined,
        lockedUntil: undefined,
        stage: "provider-failed",
        status: "failed",
        updatedAt: args.updatedAt,
      });

      if (variant && variant.status !== "failed") {
        await ctx.db.patch(variant._id, {
          failureCode,
          failureMessage,
          status: "failed",
          updatedAt: args.updatedAt,
        });
        await recalculateHookLabIdeaUse({
          ctx,
          ownerId: args.ownerId,
          updatedAt: args.updatedAt,
          useId: variant.useId,
        });
      }
    }

    const terminalJob = await ctx.db.get(job._id);

    if (!terminalJob) {
      throw new Error("Hook Lab generation job disappeared during failure handling.");
    }

    await upsertWorkerJobSummary(ctx, "provider", terminalJob);

    return {
      jobStatus: terminalJob.status,
      temporaryObjectKeys:
        variant?.status === "completed"
          ? []
          : [
              variant?.generatedImageObject?.key,
              variant?.generatedVideoObject?.key,
            ].filter((key): key is string => Boolean(key)),
      variantStatus: variant?.status === "completed" ? "completed" : "failed",
    };
  },
});
