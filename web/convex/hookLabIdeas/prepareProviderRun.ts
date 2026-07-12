import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { mutation } from "../_generated/server";

export const prepareProviderRun = mutation({
  args: {
    id: v.string(),
    ownerId: v.string(),
    requestedAt: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { id, ownerId, requestedAt, secret }) => {
    assertProviderWorkerSecret(secret);
    const idea = await ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!idea || idea.sourceType !== "social_link") {
      throw new Error("Social Idea not found.");
    }

    if (idea.providerRunId) {
      return { providerRunId: idea.providerRunId, state: "recorded" as const };
    }

    if (idea.providerRunRequestedAt) {
      return { state: "unconfirmed" as const };
    }

    await ctx.db.patch(idea._id, {
      providerRunRequestedAt: requestedAt,
      updatedAt: requestedAt,
    });

    return { state: "start" as const };
  },
});
