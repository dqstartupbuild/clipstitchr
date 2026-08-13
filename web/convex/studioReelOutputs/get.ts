import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { getStudioReelOutputForOwnerProduct } from "../studioReel/getStudioReelOutputForOwnerProduct";

export const get = query({
  args: { id: v.string(), productId: v.string() },
  handler: async (ctx, args) => {
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    return await getStudioReelOutputForOwnerProduct(
      ctx,
      ownerId,
      productId,
      assertStudioReelBoundedString(args.id, {
        label: "Studio Stitch output ID",
        maxLength: 120,
      }),
    );
  },
});
