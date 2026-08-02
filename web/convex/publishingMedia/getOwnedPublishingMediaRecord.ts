import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { getOwnedPublishingLibraryMediaRecord } from "./getOwnedPublishingLibraryMediaRecord";
import { getOwnedPublishingStitchRecord } from "./getOwnedPublishingStitchRecord";
import { getOwnedPublishingSwipeRecord } from "./getOwnedPublishingSwipeRecord";
import { publishingMediaSourceKindValidator } from "./publishingMediaSourceKindValidator";

export const get = query({
  args: {
    kind: publishingMediaSourceKindValidator,
    recordId: v.string(),
  },
  handler: async (ctx, { kind, recordId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const normalizedRecordId = recordId.trim();

    if (
      !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(normalizedRecordId)
    ) {
      return null;
    }

    if (kind === "stitch") {
      return await getOwnedPublishingStitchRecord(
        ctx,
        ownerId,
        normalizedRecordId,
      );
    }

    if (kind === "swipe") {
      return await getOwnedPublishingSwipeRecord(
        ctx,
        ownerId,
        normalizedRecordId,
      );
    }

    return await getOwnedPublishingLibraryMediaRecord(
      ctx,
      ownerId,
      normalizedRecordId,
    );
  },
});
