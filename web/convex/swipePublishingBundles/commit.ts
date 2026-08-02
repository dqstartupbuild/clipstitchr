import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { rateLimiter } from "../rateLimiter";
import { upsertSwipeCard } from "../upsertSwipeCard";
import { assertSwipePublishingBundleMatchesSwipe } from "../../lib/clipstitchr/publishing/media/assertSwipePublishingBundleMatchesSwipe";
import { createSwipePublishingEditableStateDigest } from "../../lib/clipstitchr/publishing/media/createSwipePublishingEditableStateDigest";

export const commit = mutation({
  args: {
    attemptId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { attemptId, secret }) => {
    assertRateLimitApiSecret(secret);
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const attempt = await ctx.db
      .query("swipePublishingUploadAttempts")
      .withIndex("by_owner_attempt", (index) =>
        index.eq("ownerId", ownerId).eq("attemptId", attemptId.trim()),
      )
      .unique();

    if (!attempt) {
      throw new Error("Swipe publishing upload attempt not found.");
    }

    if (attempt.status === "committed") {
      return attempt.bundle;
    }

    const swipe = await ctx.db
      .query("swipes")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", attempt.swipeId),
      )
      .unique();

    if (!swipe) {
      throw new Error("Swipe not found.");
    }

    const editableStateDigest =
      await createSwipePublishingEditableStateDigest(swipe);

    if (editableStateDigest !== attempt.bundle.editableStateDigest) {
      throw new Error(
        "This Swipe changed while its publishing images were being prepared.",
      );
    }

    assertSwipePublishingBundleMatchesSwipe({
      bundle: attempt.bundle,
      ownerId,
      revision: attempt.bundle.revision,
      slideCount: swipe.slides.length,
      swipeId: swipe.id,
    });

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const now = new Date().toISOString();
    const historicalBundle = await ctx.db
      .query("swipePublishingBundleHistory")
      .withIndex("by_owner_swipe_revision", (index) =>
        index
          .eq("ownerId", ownerId)
          .eq("swipeId", swipe.id)
          .eq("revision", attempt.bundle.revision),
      )
      .unique();

    if (
      historicalBundle &&
      JSON.stringify(historicalBundle.bundle) !== JSON.stringify(attempt.bundle)
    ) {
      throw new Error("Swipe publishing revision history is inconsistent.");
    }

    if (historicalBundle) {
      await ctx.db.patch(historicalBundle._id, { lastCommittedAt: now });
    } else {
      await ctx.db.insert("swipePublishingBundleHistory", {
        bundle: attempt.bundle,
        createdAt: attempt.bundle.createdAt,
        lastCommittedAt: now,
        ownerId,
        revision: attempt.bundle.revision,
        swipeId: swipe.id,
      });
    }

    await ctx.db.patch(swipe._id, {
      publishingBundle: attempt.bundle,
      publishingRevision: attempt.bundle.revision,
    });
    await ctx.db.patch(attempt._id, {
      committedAt: now,
      status: "committed",
      updatedAt: now,
    });

    const updatedSwipe = await ctx.db.get(swipe._id);

    if (updatedSwipe) {
      await upsertSwipeCard(ctx, updatedSwipe);
    }

    return attempt.bundle;
  },
});
