import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { getStudioReelReviewSubsetForOwnerProduct } from "../studioReel/getStudioReelReviewSubsetForOwnerProduct";
import { getStudioReelRunForOwnerProduct } from "../studioReel/getStudioReelRunForOwnerProduct";

export const get = query({
  args: { id: v.string(), productId: v.string() },
  handler: async (ctx, args) => {
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    const id = assertStudioReelBoundedString(args.id, {
      label: "Studio Stitch generation run ID",
      maxLength: 120,
    });
    const run = await getStudioReelRunForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    const reviewSubset = run?.reviewSubsetId
      ? await getStudioReelReviewSubsetForOwnerProduct(
          ctx,
          ownerId,
          productId,
          run.reviewSubsetId,
        )
      : null;
    return { run, reviewSubset };
  },
});
