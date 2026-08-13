import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { rateLimiter } from "../rateLimiter";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioPublishingActiveProduct } from "../studioPublishingScope/assertStudioPublishingActiveProduct";
import { getOwnedPublishingLibraryMediaRecord } from "./getOwnedPublishingLibraryMediaRecord";
import { getOwnedPublishingStitchRecord } from "./getOwnedPublishingStitchRecord";
import { getOwnedPublishingStudioClipOutputRecord } from "./getOwnedPublishingStudioClipOutputRecord";
import { getOwnedPublishingStudioStitchOutputRecord } from "./getOwnedPublishingStudioStitchOutputRecord";
import { getOwnedPublishingSwipeRecord } from "./getOwnedPublishingSwipeRecord";
import { publishingMediaSourceKindValidator } from "./publishingMediaSourceKindValidator";

export const get = mutation({
  args: {
    kind: publishingMediaSourceKindValidator,
    productId: v.string(),
    recordId: v.string(),
  },
  handler: async (ctx, { kind, productId, recordId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);
    const normalizedRecordId = recordId.trim();
    const normalizedProductId = productId.trim();

    if (
      !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(normalizedRecordId) ||
      !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(normalizedProductId)
    ) {
      return null;
    }

    await assertStudioPublishingActiveProduct(
      ctx,
      ownerId,
      normalizedProductId,
    );
    await rateLimiter.limit(ctx, "studioPublishingStaticRead", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "studioPublishingStaticReadGlobal", {
      throws: true,
    });

    if (kind === "stitch") {
      return await getOwnedPublishingStitchRecord(
        ctx,
        ownerId,
        normalizedProductId,
        normalizedRecordId,
      );
    }

    if (kind === "swipe") {
      return await getOwnedPublishingSwipeRecord(
        ctx,
        ownerId,
        normalizedProductId,
        normalizedRecordId,
      );
    }

    if (kind === "studio-clip-output") {
      return await getOwnedPublishingStudioClipOutputRecord(
        ctx,
        ownerId,
        normalizedProductId,
        normalizedRecordId,
      );
    }

    if (kind === "studio-stitch-output") {
      return await getOwnedPublishingStudioStitchOutputRecord(
        ctx,
        ownerId,
        normalizedProductId,
        normalizedRecordId,
      );
    }

    return await getOwnedPublishingLibraryMediaRecord(
      ctx,
      ownerId,
      normalizedProductId,
      normalizedRecordId,
    );
  },
});
