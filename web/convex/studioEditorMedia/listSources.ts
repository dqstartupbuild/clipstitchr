import { v } from "convex/values";
import type { StudioEditorMediaSourceCatalog } from "../../lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceCatalog";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioEditorActiveProduct } from "../studioEditorProjects/assertStudioEditorActiveProduct";
import { assertStudioEditorBoundedString } from "../studioEditorProjects/assertStudioEditorBoundedString";
import { consumeStudioEditorStaticReadRateLimits } from "../studioEditorRateLimits/consumeStudioEditorStaticReadRateLimits";
import { hasStudioEditorStitchObject } from "./hasStudioEditorStitchObject";
import { toStudioEditorStitchSourceDescriptor } from "./toStudioEditorStitchSourceDescriptor";
import { toStudioEditorVideoClipSourceDescriptor } from "./toStudioEditorVideoClipSourceDescriptor";

export const listSources = mutation({
  args: {
    productId: v.string(),
    limitPerKind: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<StudioEditorMediaSourceCatalog> => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productId = assertStudioEditorBoundedString(args.productId, {
      label: "Product ID",
      maxLength: 120,
    });
    await assertStudioBetaAccess(ctx, ownerId);
    await assertStudioEditorActiveProduct(ctx, ownerId, productId);
    await consumeStudioEditorStaticReadRateLimits(ctx, ownerId);

    const limit = Math.max(
      1,
      Math.min(50, Math.floor(args.limitPerKind ?? 24)),
    );
    const [videoClips, stitches] = await Promise.all([
      ctx.db
        .query("videoClipCards")
        .withIndex("by_owner_product_created", (index) =>
          index.eq("ownerId", ownerId).eq("productId", productId),
        )
        .order("desc")
        .take(limit),
      ctx.db
        .query("stitchCards")
        .withIndex("by_owner_product_created", (index) =>
          index.eq("ownerId", ownerId).eq("productId", productId),
        )
        .order("desc")
        .take(limit),
    ]);
    return {
      videoClips: videoClips.map(toStudioEditorVideoClipSourceDescriptor),
      stitches: stitches
        .filter(hasStudioEditorStitchObject)
        .map(toStudioEditorStitchSourceDescriptor),
    };
  },
});
