import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { query } from "../_generated/server";

export const getForProvider = query({
  args: {
    id: v.string(),
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { id, ownerId, secret }) => {
    assertProviderWorkerSecret(secret);

    const idea = await ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id),
      )
      .unique();

    if (!idea) {
      return null;
    }

    const sourceStitch = idea.sourceStitchId
      ? await ctx.db
          .query("stitches")
          .withIndex("by_owner_id", (index) =>
            index.eq("ownerId", ownerId).eq("id", idea.sourceStitchId!),
          )
          .unique()
      : null;
    const [sourceUgcClip, sourceDemoClip] = sourceStitch
      ? await Promise.all([
          ctx.db
            .query("videoClips")
            .withIndex("by_owner_id", (index) =>
              index.eq("ownerId", ownerId).eq("id", sourceStitch.ugcClipId),
            )
            .unique(),
          ctx.db
            .query("videoClips")
            .withIndex("by_owner_id", (index) =>
              index.eq("ownerId", ownerId).eq("id", sourceStitch.demoClipId),
            )
            .unique(),
        ])
      : [null, null];

    return {
      idea,
      sourceDemoClip,
      sourceStitch,
      sourceUgcClip,
    };
  },
});
