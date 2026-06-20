import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { query } from "./_generated/server";
import {
  getProductAggregateNamespace,
  stitchCounts,
  stitchProductCounts,
  videoClipCounts,
  videoClipProductCounts,
} from "./aggregateCounts";
import { v } from "convex/values";

export const get = query({
  args: {
    productId: v.optional(v.string()),
  },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productFilterId = productId?.trim() || undefined;

    if (productFilterId) {
      const productNamespace = getProductAggregateNamespace(
        ownerId,
        productFilterId,
      );
      const accountNamespace = getProductAggregateNamespace(ownerId, undefined);
      const [
        accountWideUgcClips,
        productUgcClips,
        demoClips,
        swapClips,
        activeStitches,
        postedStitches,
      ] = await Promise.all([
        videoClipProductCounts.count(ctx, {
          bounds: { eq: "ugc" },
          namespace: accountNamespace,
        }),
        videoClipProductCounts.count(ctx, {
          bounds: { eq: "ugc" },
          namespace: productNamespace,
        }),
        videoClipProductCounts.count(ctx, {
          bounds: { eq: "demo" },
          namespace: productNamespace,
        }),
        videoClipProductCounts.count(ctx, {
          bounds: { eq: "swapr" },
          namespace: productNamespace,
        }),
        stitchProductCounts.count(ctx, {
          bounds: { eq: "active" },
          namespace: productNamespace,
        }),
        stitchProductCounts.count(ctx, {
          bounds: { eq: "posted" },
          namespace: productNamespace,
        }),
      ]);

      return {
        activeStitches,
        cliprClips: 0,
        demoClips,
        postedStitches,
        stitches: activeStitches + postedStitches,
        swapClips,
        ugcClips: accountWideUgcClips + productUgcClips,
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
