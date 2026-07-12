import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { mutation } from "../_generated/server";

export const failAnalysisFromProvider = mutation({
  args: {
    failureCode: v.string(),
    failureMessage: v.string(),
    id: v.string(),
    ownerId: v.string(),
    secret: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    const idea = await ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id),
      )
      .unique();

    if (
      !idea ||
      (idea.status !== "analyzing" && idea.status !== "needs_attention")
    ) {
      return null;
    }

    await ctx.db.patch(idea._id, {
      failureCode: args.failureCode.trim().slice(0, 100),
      failureMessage: args.failureMessage.trim().slice(0, 300),
      status: "failed",
      updatedAt: args.updatedAt,
    });

    return idea.id;
  },
});
