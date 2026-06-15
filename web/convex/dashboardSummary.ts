import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { query } from "./_generated/server";
import { stitchCounts, videoClipCounts } from "./aggregateCounts";

const recentDashboardItemLimit = 4;

export const get = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const [
      ugcClips,
      demoClips,
      legacyCliprClips,
      swapClips,
      stitches,
      recentUploads,
      recentStitches,
      recentSwipes,
    ] = await Promise.all([
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
      ctx.db
        .query("videoClips")
        .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
        .order("desc")
        .take(recentDashboardItemLimit),
      ctx.db
        .query("stitches")
        .withIndex("by_owner_is_posted_created", (q) =>
          q.eq("ownerId", ownerId).eq("isPosted", undefined),
        )
        .order("desc")
        .take(recentDashboardItemLimit),
      ctx.db
        .query("swipes")
        .withIndex("by_owner_updated", (q) => q.eq("ownerId", ownerId))
        .order("desc")
        .filter((q) => q.eq(q.field("isPosted"), undefined))
        .take(recentDashboardItemLimit),
    ]);
    const stitchSourceClipIds = [
      ...new Set(
        recentStitches.flatMap((stitch) => [
          stitch.ugcClipId,
          stitch.demoClipId,
        ]),
      ),
    ];
    const swipeBackgroundIds = [
      ...new Set(
        recentSwipes.flatMap((swipe) => [
          swipe.backgroundId,
          ...swipe.slides
            .map((slide) => slide.backgroundId)
            .filter((id): id is string => Boolean(id)),
        ]),
      ),
    ];
    const [stitchSourceClips, recentSwipeBackgrounds] = await Promise.all([
      Promise.all(
        stitchSourceClipIds.map((id) =>
          ctx.db
            .query("videoClips")
            .withIndex("by_owner_id", (q) =>
              q.eq("ownerId", ownerId).eq("id", id),
            )
            .unique(),
        ),
      ),
      Promise.all(
        swipeBackgroundIds.map((id) =>
          ctx.db
            .query("swiprBackgrounds")
            .withIndex("by_background_id", (q) => q.eq("id", id))
            .unique(),
        ),
      ),
    ]);

    return {
      counts: {
        activeStitches: 0,
        cliprClips: 0,
        demoClips,
        postedStitches: 0,
        stitches,
        swapClips,
        ugcClips: ugcClips + legacyCliprClips,
      },
      recentStitches,
      recentSwipeBackgrounds: recentSwipeBackgrounds.filter(Boolean),
      recentSwipes,
      recentUploads,
      stitchSourceClips: stitchSourceClips.filter(Boolean),
    };
  },
});
