import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { mutation } from "../_generated/server";
import { upsertWorkerJobSummary } from "../upsertWorkerJobSummary";

export const failAnalysisJobFromProvider = mutation({
  args: {
    failureCode: v.string(),
    failureMessage: v.string(),
    ideaId: v.string(),
    jobId: v.string(),
    ownerId: v.string(),
    secret: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);
    const [job, idea] = await Promise.all([
      ctx.db
        .query("providerJobs")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.jobId),
        )
        .unique(),
      ctx.db
        .query("hookLabIdeas")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.ideaId),
        )
        .unique(),
    ]);

    if (!job || job.jobType !== "hook-lab-idea-analysis") {
      throw new Error("Hook Lab analysis job not found.");
    }

    if (job.status === "completed" || job.status === "canceled") {
      return { ideaStatus: idea?.status, jobStatus: job.status };
    }

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

    if (
      idea &&
      (idea.status === "analyzing" || idea.status === "needs_attention")
    ) {
      await ctx.db.patch(idea._id, {
        failureCode,
        failureMessage,
        status: "failed",
        updatedAt: args.updatedAt,
      });
    }

    const failedJob = await ctx.db.get(job._id);

    if (!failedJob) {
      throw new Error("Hook Lab analysis job disappeared during failure handling.");
    }

    await upsertWorkerJobSummary(ctx, "provider", failedJob);

    return {
      ideaStatus:
        idea &&
        (idea.status === "analyzing" || idea.status === "needs_attention")
          ? "failed"
          : idea?.status,
      jobStatus: failedJob.status,
    };
  },
});
