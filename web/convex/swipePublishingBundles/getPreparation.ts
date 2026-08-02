import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { getSwiprSwipeReferencedBackgroundIds } from "../getSwiprSwipeReferencedBackgroundIds";
import { createSwipePublishingEditableStateDigest } from "../../lib/clipstitchr/publishing/media/createSwipePublishingEditableStateDigest";

export const get = query({
  args: {
    swipeId: v.string(),
  },
  handler: async (ctx, { swipeId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const swipe = await ctx.db
      .query("swipes")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", swipeId.trim()),
      )
      .unique();

    if (!swipe) {
      return null;
    }

    const backgroundIds = getSwiprSwipeReferencedBackgroundIds([swipe]);
    const backgrounds = await Promise.all(
      backgroundIds.map(async (id) => {
        const background = await ctx.db
          .query("swiprBackgrounds")
          .withIndex("by_background_id", (index) => index.eq("id", id))
          .unique();

        if (!background || background.uploadedByOwnerId !== ownerId) {
          throw new Error("A saved Swipe background is unavailable.");
        }

        return {
          id: background.id,
          imageObject: background.imageObject,
        };
      }),
    );

    return {
      backgrounds,
      editableStateDigest:
        await createSwipePublishingEditableStateDigest(swipe),
      existingBundle: swipe.publishingBundle,
      slideCount: swipe.slides.length,
      swipeId: swipe.id,
    };
  },
});
