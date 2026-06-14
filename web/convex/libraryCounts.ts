import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { query } from "./_generated/server";
import { stitchCounts, videoClipCounts } from "./aggregateCounts";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const [ugcClips, demoClips, legacyCliprClips, swapClips, stitches] =
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
      activeStitches: 0,
      cliprClips: 0,
      demoClips,
      postedStitches: 0,
      stitches,
      swapClips,
      ugcClips: ugcClips + legacyCliprClips,
    };
  },
});
