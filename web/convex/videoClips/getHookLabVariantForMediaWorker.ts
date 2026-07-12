import { v } from "convex/values";
import { assertMediaWorkerSecret } from "../auth/assertMediaWorkerSecret";
import { query } from "../_generated/server";

export const getHookLabVariantForMediaWorker = query({
  args: {
    id: v.string(),
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { id, ownerId, secret }) => {
    assertMediaWorkerSecret(secret);
    const clip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!clip?.hookLabIdeaId || !clip.hookLabIdeaUseId) {
      return null;
    }

    return {
      id: clip.id,
      posterObject: clip.posterObject,
      videoObject: clip.videoObject,
    };
  },
});
