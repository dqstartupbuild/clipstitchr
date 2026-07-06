import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { query } from "../_generated/server";
import { cliLibraryListLimit } from "./cliLibraryListLimit";
import { videoClipLibraryKindValidator } from "../validators/videoClipLibraryKind";

export const listCliClips = query({
  args: {
    kind: v.optional(videoClipLibraryKindValidator),
    limit: v.optional(v.number()),
    ownerId: v.string(),
    productId: v.optional(v.string()),
    secret: v.string(),
  },
  handler: async (ctx, { kind, limit, ownerId, productId, secret }) => {
    assertRateLimitApiSecret(secret);

    const normalizedProductId = productId?.trim() || undefined;
    const requestedLimit =
      Number.isFinite(limit) && limit && limit > 0
        ? Math.min(Math.floor(limit), cliLibraryListLimit)
        : cliLibraryListLimit;
    const clips = await ctx.db
      .query("videoClipCards")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(cliLibraryListLimit * 4);

    return clips
      .filter((clip) => !kind || clip.libraryKind === kind)
      .filter((clip) => !normalizedProductId || clip.productId === normalizedProductId)
      .slice(0, requestedLimit)
      .map((clip) => ({
        createdAt: clip.createdAt,
        duration: clip.duration,
        id: clip.id,
        isPosted: clip.isPosted,
        kind: clip.libraryKind,
        name: clip.name,
        productId: clip.productId,
        updatedAt: clip.updatedAt,
      }));
  },
});
