import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const retry = mutation({
  args: {
    id: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const idea = await ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!idea) {
      throw new Error("Idea not found.");
    }

    if (idea.status !== "failed" && idea.status !== "needs_attention") {
      throw new Error("This idea does not need another try right now.");
    }

    const shouldRestartSocialImport =
      idea.sourceType === "social_link" &&
      (idea.failureCode === "social_import_failed" ||
        idea.failureCode === "social_import_start_unconfirmed" ||
        idea.failureCode === "source_video_unavailable");

    await ctx.db.patch(idea._id, {
      failureCode: undefined,
      failureMessage: undefined,
      providerDatasetId: shouldRestartSocialImport
        ? undefined
        : idea.providerDatasetId,
      providerPredictionId: undefined,
      providerRunId: shouldRestartSocialImport ? undefined : idea.providerRunId,
      providerRunRequestedAt: shouldRestartSocialImport
        ? undefined
        : idea.providerRunRequestedAt,
      status: "analyzing",
      updatedAt,
    });

    return idea;
  },
});
