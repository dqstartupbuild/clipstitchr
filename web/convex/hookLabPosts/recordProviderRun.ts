import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { mutation } from "../_generated/server";

export const recordProviderRun = mutation({
  args: {
    id: v.string(),
    ownerId: v.string(),
    providerDatasetId: v.optional(v.string()),
    providerRunId: v.string(),
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

    await ctx.db.patch(post._id, {
      providerDatasetId: args.providerDatasetId,
      providerRunId: args.providerRunId.trim().slice(0, 180),
      updatedAt: args.updatedAt,
    });

    return post.id;
  },
});
