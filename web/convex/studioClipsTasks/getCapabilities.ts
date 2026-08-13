import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioClipsActiveProduct } from "./assertStudioClipsActiveProduct";
import { assertStudioClipsIdentifier } from "./assertStudioClipsIdentifier";
import { getStudioClipsExecutionAvailability } from "./getStudioClipsExecutionAvailability";

export const getCapabilities = query({
  args: { productId: v.string() },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);
    const productId = assertStudioClipsIdentifier(args.productId, "Product ID");
    await assertStudioClipsActiveProduct(ctx, ownerId, productId);
    return getStudioClipsExecutionAvailability();
  },
});
