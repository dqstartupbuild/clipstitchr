import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioLazyReelActiveProduct } from "../studioLazyReel/assertStudioLazyReelActiveProduct";
import { assertStudioLazyReelBoundedString } from "../studioLazyReel/assertStudioLazyReelBoundedString";
import { getStudioLazyReelCreativeBriefForOwnerProduct } from "./getStudioLazyReelCreativeBriefForOwnerProduct";

export const get = query({
  args: {
    id: v.string(),
    productId: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productId = assertStudioLazyReelBoundedString(args.productId, {
      label: "Product ID",
      maxLength: 120,
    });

    await assertStudioBetaAccess(ctx, ownerId);
    await assertStudioLazyReelActiveProduct(ctx, ownerId, productId);

    const id = assertStudioLazyReelBoundedString(args.id, {
      label: "Creative brief ID",
      maxLength: 120,
    });

    return await getStudioLazyReelCreativeBriefForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
  },
});
