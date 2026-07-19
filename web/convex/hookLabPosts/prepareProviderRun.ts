import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { mutation } from "../_generated/server";

export const prepareProviderRun = mutation({
  args: {
    id: v.string(),
    ownerId: v.string(),
    secret: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);
    const post = await ctx.db
      .query("hookLabPosts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id.trim()),
      )
      .unique();

    if (!post) {
      throw new Error("Hook Lab post not found.");
    }

    if (post.providerRunId) {
      return {
        action: "reuse" as const,
        providerDatasetId: post.providerDatasetId,
        providerRunId: post.providerRunId,
      };
    }

    if (post.providerRunRequestedAt) {
      return { action: "wait" as const };
    }

    await ctx.db.patch(post._id, {
      providerRunRequestedAt: args.updatedAt,
      updatedAt: args.updatedAt,
    });

    return { action: "start" as const };
  },
});
