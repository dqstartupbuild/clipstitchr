import { v } from "convex/values";
import { assertMediaWorkerSecret } from "../auth/assertMediaWorkerSecret";
import { mutation } from "../_generated/server";
import { recalculateHookLabIdeaUse } from "./recalculateHookLabIdeaUse";

export const failFromMediaWorker = mutation({
  args: {
    failureCode: v.string(),
    failureMessage: v.string(),
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

    if (!variant || variant.status === "completed") {
      return null;
    }

    await ctx.db.patch(variant._id, {
      failureCode: args.failureCode.trim().slice(0, 100),
      failureMessage: args.failureMessage.trim().slice(0, 300),
      status: "failed",
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
