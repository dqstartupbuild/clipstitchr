import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioEditorActiveProduct } from "./assertStudioEditorActiveProduct";
import { assertStudioEditorBoundedString } from "./assertStudioEditorBoundedString";
import { getStudioEditorProjectForOwnerProduct } from "./getStudioEditorProjectForOwnerProduct";
import { toStudioEditorProjectRecord } from "./toStudioEditorProjectRecord";

export const get = query({
  args: { id: v.string(), productId: v.string() },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productId = assertStudioEditorBoundedString(args.productId, {
      label: "Product ID",
      maxLength: 120,
    });
    await assertStudioBetaAccess(ctx, ownerId);
    await assertStudioEditorActiveProduct(ctx, ownerId, productId);
    const id = assertStudioEditorBoundedString(args.id, {
      label: "Studio editor project ID",
      maxLength: 120,
    });
    const project = await getStudioEditorProjectForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    return project ? toStudioEditorProjectRecord(project) : null;
  },
});
