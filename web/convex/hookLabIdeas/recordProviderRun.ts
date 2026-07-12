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
  handler: async (
    ctx,
    {
      id,
      ownerId,
      providerDatasetId,
      providerRunId,
      secret,
      updatedAt,
    },
  ) => {
    assertProviderWorkerSecret(secret);

    const idea = await ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id),
      )
      .unique();

    if (!idea) {
      throw new Error("Idea not found.");
    }

    if (idea.providerRunId && idea.providerRunId !== providerRunId) {
      throw new Error("This social import already has a different provider run.");
    }

    await ctx.db.patch(idea._id, {
      ...(providerDatasetId ? { providerDatasetId } : {}),
      providerRunId,
      updatedAt,
    });

    return idea.id;
  },
});
