import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { mutation } from "../_generated/server";
import { r2ObjectValidator } from "../validators/r2Object";

export const recordGeneratedVideoFromProvider = mutation({
  args: {
    id: v.string(),
    ownerId: v.string(),
    predictionId: v.string(),
    secret: v.string(),
    updatedAt: v.string(),
    videoObject: r2ObjectValidator,
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);
    const variant = await ctx.db
      .query("hookLabIdeaVariants")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id),
      )
      .unique();

    if (!variant || variant.status === "completed" || variant.status === "failed") {
      throw new Error("Idea version is no longer generating.");
    }

    const expectedPrefix = `users/${encodeURIComponent(args.ownerId)}/`;

    if (!args.videoObject.key.startsWith(expectedPrefix)) {
      throw new Error("Generated video does not belong to this account.");
    }

    await ctx.db.patch(variant._id, {
      generatedVideoObject: args.videoObject,
      providerPredictionIds: Array.from(
        new Set([...variant.providerPredictionIds, args.predictionId]),
      ).slice(0, 12),
      status: "creating_opening",
      updatedAt: args.updatedAt,
    });

    return variant.id;
  },
});
