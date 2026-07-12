import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { mutation } from "../_generated/server";

export const markFinalizingFromProvider = mutation({
  args: {
    id: v.string(),
    ownerId: v.string(),
    providerPredictionIds: v.array(v.string()),
    secret: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);
    const variant = await ctx.db
      .query("hookLabIdeaVariants")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id),
      )
      .unique();

    if (!variant) {
      throw new Error("Idea version not found.");
    }

    if (variant.status === "completed" || variant.status === "failed") {
      throw new Error("Idea version is no longer generating.");
    }

    await ctx.db.patch(variant._id, {
      providerPredictionIds: Array.from(
        new Set([...variant.providerPredictionIds, ...args.providerPredictionIds]),
      ).slice(0, 12),
      status: "finalizing",
      updatedAt: args.updatedAt,
    });

    return variant.id;
  },
});
