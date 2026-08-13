import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertProductBelongsToOwner } from "../assertProductBelongsToOwner";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { listStudioBetaRecentClipCards } from "./listStudioBetaRecentClipCards";
import { listStudioBetaRecentStitchCards } from "./listStudioBetaRecentStitchCards";

export const getStudioBetaWorkspaceSummary = query({
  args: { productId: v.string() },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await assertStudioBetaAccess(ctx, ownerId);
    await assertProductBelongsToOwner(ctx, ownerId, productId);

    const [clips, stitches, product] = await Promise.all([
      listStudioBetaRecentClipCards(ctx, ownerId, productId),
      listStudioBetaRecentStitchCards(ctx, ownerId, productId),
      ctx.db
        .query("products")
        .withIndex("by_owner_id", (query) =>
          query.eq("ownerId", ownerId).eq("id", productId),
        )
        .unique(),
    ]);
    const recentMedia = [
      ...clips.map((clip) => ({
        createdAt: clip.createdAt,
        duration: clip.duration,
        id: clip.id,
        kind: "source" as const,
        name: clip.name,
        posterObject: clip.posterObject,
      })),
      ...stitches.map((stitch) => ({
        createdAt: stitch.createdAt,
        duration: stitch.duration,
        id: stitch.id,
        kind: "stitch" as const,
        name: stitch.name,
        posterObject: stitch.posterObject,
      })),
    ]
      .toSorted((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 8);

    return {
      productName: product?.name ?? "Current product",
      recentMedia,
      sourceCount: clips.length,
      stitchCount: stitches.length,
    };
  },
});
