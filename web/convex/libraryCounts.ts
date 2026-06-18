import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { query } from "./_generated/server";
import { stitchCounts, videoClipCounts } from "./aggregateCounts";
import { v } from "convex/values";

export const get = query({
  args: {
    productId: v.optional(v.string()),
  },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productFilterId = productId?.trim() || undefined;

    if (productFilterId) {
      const [clips, stitches] = await Promise.all([
        ctx.db
          .query("videoClips")
          .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
          .filter((q) => q.eq(q.field("productId"), productFilterId))
          .collect(),
        ctx.db
          .query("stitches")
          .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
          .filter((q) => q.eq(q.field("productId"), productFilterId))
          .collect(),
      ]);
      const ugcClips = clips.filter(
        (clip) =>
          clip.clipType === "ugc" && clip.swaprMetadata?.source !== "swapr",
      ).length;
      const cliprClips = clips.filter(
        (clip) => clip.libraryKind === "clipr",
      ).length;

      return {
        activeStitches: stitches.filter((stitch) => !stitch.isPosted).length,
        cliprClips: 0,
        demoClips: clips.filter((clip) => clip.clipType === "demo").length,
        postedStitches: stitches.filter((stitch) => stitch.isPosted).length,
        stitches: stitches.length,
        swapClips: clips.filter(
          (clip) => clip.swaprMetadata?.source === "swapr",
        ).length,
        ugcClips: ugcClips + cliprClips,
      };
    }

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
