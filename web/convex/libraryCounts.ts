import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { query } from "./_generated/server";
import { stitchCounts, videoClipCounts } from "./aggregateCounts";

export const get = query({
  args: {
    refreshNonce: v.optional(v.number()),
  },
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const [ugcClips, demoClips, cliprClips, swapClips, stitches] =
      await Promise.all([
      videoClipCounts.count(ctx, {
        bounds: { eq: "ugc" },
        namespace: ownerId,
      }),
      videoClipCounts.count(ctx, {
        bounds: { eq: "demo" },
        namespace: ownerId,
      }),
      videoClipCounts.count(ctx, {
        bounds: { eq: "clipr" },
        namespace: ownerId,
      }),
      videoClipCounts.count(ctx, {
        bounds: { eq: "swapr" },
        namespace: ownerId,
      }),
      stitchCounts.count(ctx, { namespace: ownerId }),
    ]);

    return {
      cliprClips,
      demoClips,
      stitches,
      swapClips,
      ugcClips,
    };
  },
});
