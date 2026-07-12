import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexRecordDelete", {
      key: ownerId,
      throws: true,
    });

    const idea = await ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!idea) {
      return null;
    }

    if (idea.status === "analyzing" || idea.status === "generating") {
      throw new Error(
        "Hook Lab is still working on this idea. Let it finish before deleting it.",
      );
    }

    const [existingUse] = await ctx.db
      .query("hookLabIdeaUses")
      .withIndex("by_owner_idea_created", (query) =>
        query.eq("ownerId", ownerId).eq("ideaId", idea.id),
      )
      .take(1);

    if (idea.useCount > 0 || existingUse) {
      throw new Error("Archive this idea instead so its past Stitches stay connected.");
    }

    if (idea.sourceHookOptionId) {
      const option = await ctx.db
        .query("stitchrHookOptions")
        .withIndex("by_owner_id", (query) =>
          query.eq("ownerId", ownerId).eq("id", idea.sourceHookOptionId!),
        )
        .unique();

      if (option?.linkedIdeaId === idea.id) {
        await ctx.db.patch(option._id, {
          linkedIdeaId: undefined,
          reviewState: "needs_review",
          reviewedAt: undefined,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    await ctx.db.delete(idea._id);
    return {
      id: idea.id,
      thumbnailObject: idea.thumbnailObject,
    };
  },
});
