import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { getSwiprSwipeReferencedBackgroundIds } from "../getSwiprSwipeReferencedBackgroundIds";
import { rateLimiter } from "../rateLimiter";
import { consumeR2UploadLimits } from "../rateLimits/consumeR2UploadLimits";
import { swipePublishingBundleValidator } from "../validators/swipePublishingBundle";
import { assertSwipePublishingBundleMatchesSwipe } from "../../lib/clipstitchr/publishing/media/assertSwipePublishingBundleMatchesSwipe";
import { createSwipePublishingEditableStateDigest } from "../../lib/clipstitchr/publishing/media/createSwipePublishingEditableStateDigest";
import { createSwipePublishingRevision } from "../../lib/clipstitchr/publishing/media/createSwipePublishingRevision";
import { SWIPE_PUBLISHING_RENDERER_VERSION } from "../../lib/clipstitchr/publishing/media/swipePublishingRendererVersion";

export const reserve = mutation({
  args: {
    attemptId: v.string(),
    bundle: swipePublishingBundleValidator,
    expiresAt: v.string(),
    secret: v.string(),
    swipeId: v.string(),
  },
  handler: async (ctx, { attemptId, bundle, expiresAt, secret, swipeId }) => {
    assertRateLimitApiSecret(secret);
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const swipe = await ctx.db
      .query("swipes")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", swipeId),
      )
      .unique();

    if (!swipe || !attemptId.trim() || attemptId.length > 120) {
      throw new Error("Swipe publishing reservation is invalid.");
    }

    const existingAttempt = await ctx.db
      .query("swipePublishingUploadAttempts")
      .withIndex("by_owner_attempt", (index) =>
        index.eq("ownerId", ownerId).eq("attemptId", attemptId),
      )
      .unique();

    if (existingAttempt) {
      throw new Error("Swipe publishing reservation already exists.");
    }

    const editableStateDigest =
      await createSwipePublishingEditableStateDigest(swipe);
    const currentBackgroundIds = new Set(
      getSwiprSwipeReferencedBackgroundIds([swipe]),
    );

    if (
      bundle.editableStateDigest !== editableStateDigest ||
      bundle.rendererVersion !== SWIPE_PUBLISHING_RENDERER_VERSION ||
      bundle.backgrounds.length !== currentBackgroundIds.size
    ) {
      throw new Error("Swipe publishing render inputs changed.");
    }

    for (const identity of bundle.backgrounds) {
      const background = await ctx.db
        .query("swiprBackgrounds")
        .withIndex("by_background_id", (index) => index.eq("id", identity.id))
        .unique();

      if (
        !currentBackgroundIds.has(identity.id) ||
        !background ||
        background.uploadedByOwnerId !== ownerId ||
        background.imageObject.key !== identity.objectKey ||
        background.imageObject.contentType !== identity.contentType ||
        background.imageObject.size !== identity.sizeBytes
      ) {
        throw new Error("Swipe publishing background identity changed.");
      }
    }

    const expectedRevision = await createSwipePublishingRevision({
      backgrounds: bundle.backgrounds,
      editableStateDigest,
      rendererVersion: bundle.rendererVersion,
    });

    if (bundle.revision !== expectedRevision) {
      throw new Error("Swipe publishing revision is invalid.");
    }

    assertSwipePublishingBundleMatchesSwipe({
      bundle,
      ownerId,
      revision: expectedRevision,
      slideCount: swipe.slides.length,
      swipeId: swipe.id,
    });

    const now = new Date();
    const expiration = new Date(expiresAt);

    if (
      !Number.isFinite(expiration.getTime()) ||
      expiration <= now ||
      expiration.getTime() - now.getTime() > 60 * 60 * 1000
    ) {
      throw new Error("Swipe publishing reservation expiry is invalid.");
    }

    const totalBytes = bundle.slides.reduce(
      (sum, slide) => sum + slide.object.size,
      0,
    );

    await consumeR2UploadLimits(ctx, {
      objectCount: bundle.slides.length,
      ownerId,
      totalBytes,
    });
    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    const createdAt = now.toISOString();

    await ctx.db.insert("swipePublishingUploadAttempts", {
      attemptId,
      bundle,
      createdAt,
      expiresAt: expiration.toISOString(),
      ownerId,
      status: "reserved",
      swipeId: swipe.id,
      updatedAt: createdAt,
    });

    return { attemptId };
  },
});
