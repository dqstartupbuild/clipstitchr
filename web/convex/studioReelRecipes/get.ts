import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { getStudioReelRecipeForOwnerProduct } from "../studioReel/getStudioReelRecipeForOwnerProduct";

export const get = query({
  args: { id: v.string(), productId: v.string() },
  handler: async (ctx, args) => {
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    return await getStudioReelRecipeForOwnerProduct(
      ctx,
      ownerId,
      productId,
      assertStudioReelBoundedString(args.id, {
        label: "Studio Stitch recipe ID",
        maxLength: 120,
      }),
    );
  },
});
