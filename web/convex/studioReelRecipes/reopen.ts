import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { assertStudioReelPositiveInteger } from "../studioReel/assertStudioReelPositiveInteger";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";
import { changeStudioReelRecipeStatus } from "./changeStatus";

export const reopen = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    expectedRevision: v.number(),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    return await changeStudioReelRecipeStatus(ctx, {
      ownerId,
      productId,
      recipeId: assertStudioReelBoundedString(args.id, {
        label: "Studio Stitch recipe ID",
        maxLength: 120,
      }),
      expectedRevision: assertStudioReelPositiveInteger(
        args.expectedRevision,
        "Expected revision",
        Number.MAX_SAFE_INTEGER,
      ),
      idempotencyKey: assertStudioReelBoundedString(args.idempotencyKey, {
        label: "Idempotency key",
        maxLength: 200,
      }),
      operation: "reopenRecipe",
      fromStatus: "archived",
      toStatus: "active",
    });
  },
});
