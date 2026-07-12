import { v } from "convex/values";
import { assertMediaWorkerSecret } from "../auth/assertMediaWorkerSecret";
import { mutation } from "../_generated/server";
import { upsertWorkerJobSummary } from "../upsertWorkerJobSummary";
import { recalculateHookLabIdeaUse } from "./recalculateHookLabIdeaUse";

export const failFinalizationJobFromMediaWorker = mutation({
  args: {
    failureCode: v.string(),
    failureMessage: v.string(),
    mediaJobId: v.string(),
    ownerId: v.string(),
    providerJobId: v.string(),
    secret: v.string(),
    updatedAt: v.string(),
    variantId: v.string(),
  },
  handler: async (ctx, args) => {
    assertMediaWorkerSecret(args.secret);
    const [mediaJob, providerJob, variant] = await Promise.all([
      ctx.db
        .query("mediaJobs")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.mediaJobId),
        )
        .unique(),
      ctx.db
        .query("providerJobs")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.providerJobId),
        )
        .unique(),
      ctx.db
        .query("hookLabIdeaVariants")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.variantId),
        )
        .unique(),
    ]);

    if (!mediaJob || mediaJob.jobType !== "hook-lab-variant-finalization") {
      throw new Error("Hook Lab media job not found.");
    }

    if (mediaJob.status === "completed") {
      return {
        mediaJobStatus: mediaJob.status,
        providerJobStatus: providerJob?.status,
        variantStatus: variant?.status,
      };
    }

    const failureCode = args.failureCode.trim().slice(0, 100);
    const failureMessage = args.failureMessage.trim().slice(0, 300);

    if (variant?.status === "completed") {
      const mediaOutputAssetIds =
        variant.finishedStitchId &&
        !mediaJob.outputAssetIds.includes(variant.finishedStitchId)
          ? [...mediaJob.outputAssetIds, variant.finishedStitchId]
          : mediaJob.outputAssetIds;

      await ctx.db.patch(mediaJob._id, {
        completedAt: variant.completedAt ?? args.updatedAt,
        error: undefined,
        lockedBy: undefined,
        lockedUntil: undefined,
        outputAssetIds: mediaOutputAssetIds,
        stage: "completed",
        status: "completed",
        updatedAt: args.updatedAt,
      });

      if (providerJob) {
        const providerOutputAssetIds =
          variant.finishedStitchId &&
          !providerJob.outputAssetIds.includes(variant.finishedStitchId)
            ? [...providerJob.outputAssetIds, variant.finishedStitchId]
            : providerJob.outputAssetIds;

        await ctx.db.patch(providerJob._id, {
          completedAt: variant.completedAt ?? args.updatedAt,
          error: undefined,
          lockedBy: undefined,
          lockedUntil: undefined,
          outputAssetIds: providerOutputAssetIds,
          progress: 1,
          stage: "completed",
          status: "completed",
          updatedAt: args.updatedAt,
        });
      }
    } else {
      await ctx.db.patch(mediaJob._id, {
        error: failureMessage,
        lockedBy: undefined,
        lockedUntil: undefined,
        stage: "failed",
        status: "failed",
        updatedAt: args.updatedAt,
      });

      if (providerJob) {
        await ctx.db.patch(providerJob._id, {
          error: failureMessage,
          lockedBy: undefined,
          lockedUntil: undefined,
          stage: "media-finalization-failed",
          status: "failed",
          updatedAt: args.updatedAt,
        });
      }

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

    const [terminalMediaJob, terminalProviderJob] = await Promise.all([
      ctx.db.get(mediaJob._id),
      providerJob ? ctx.db.get(providerJob._id) : Promise.resolve(null),
    ]);

    if (!terminalMediaJob) {
      throw new Error("Hook Lab media job disappeared during failure handling.");
    }

    await upsertWorkerJobSummary(ctx, "media", terminalMediaJob);

    if (terminalProviderJob) {
      await upsertWorkerJobSummary(ctx, "provider", terminalProviderJob);
    }

    return {
      mediaJobStatus: terminalMediaJob.status,
      providerJobStatus: terminalProviderJob?.status,
      variantStatus: variant?.status === "completed" ? "completed" : "failed",
    };
  },
});
