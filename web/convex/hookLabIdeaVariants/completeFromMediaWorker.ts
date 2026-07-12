import { v } from "convex/values";
import { assertMediaWorkerSecret } from "../auth/assertMediaWorkerSecret";
import { mutation } from "../_generated/server";
import { recalculateHookLabIdeaUse } from "./recalculateHookLabIdeaUse";

export const completeFromMediaWorker = mutation({
  args: {
    finishedStitchId: v.string(),
    generatedUgcClipId: v.string(),
    id: v.string(),
    ownerId: v.string(),
    secret: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    assertMediaWorkerSecret(args.secret);
    const variant = await ctx.db
      .query("hookLabIdeaVariants")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id),
      )
      .unique();

    if (!variant) {
      throw new Error("Idea version not found.");
    }

    if (variant.status === "completed") {
      return variant.id;
    }

    if (variant.status === "failed") {
      return null;
    }

    await ctx.db.patch(variant._id, {
      completedAt: args.updatedAt,
      failureCode: undefined,
      failureMessage: undefined,
      finishedStitchId: args.finishedStitchId,
      generatedUgcClipId: args.generatedUgcClipId,
      status: "completed",
      updatedAt: args.updatedAt,
    });
    await recalculateHookLabIdeaUse({
      ctx,
      ownerId: args.ownerId,
      updatedAt: args.updatedAt,
      useId: variant.useId,
    });

    return variant.id;
  },
});
