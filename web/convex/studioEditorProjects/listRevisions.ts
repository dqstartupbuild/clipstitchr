import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioEditorActiveProduct } from "./assertStudioEditorActiveProduct";
import { assertStudioEditorBoundedString } from "./assertStudioEditorBoundedString";
import { getStudioEditorProjectForOwnerProduct } from "./getStudioEditorProjectForOwnerProduct";
import { toStudioEditorProjectRevisionRecord } from "./toStudioEditorProjectRevisionRecord";

export const listRevisions = query({
  args: {
    id: v.string(),
    limit: v.optional(v.number()),
    productId: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productId = assertStudioEditorBoundedString(args.productId, {
      label: "Product ID",
      maxLength: 120,
    });
    await assertStudioBetaAccess(ctx, ownerId);
    await assertStudioEditorActiveProduct(ctx, ownerId, productId);
    const projectId = assertStudioEditorBoundedString(args.id, {
      label: "Studio editor project ID",
      maxLength: 120,
    });
    const project = await getStudioEditorProjectForOwnerProduct(
      ctx,
      ownerId,
      productId,
      projectId,
    );
    if (!project) return [];
    const limit = Math.max(1, Math.min(100, Math.floor(args.limit ?? 30)));
    const revisions = await ctx.db
      .query("studioEditorProjectRevisions")
      .withIndex("by_owner_product_project_revision", (index) =>
        index
          .eq("ownerId", ownerId)
          .eq("productId", productId)
          .eq("projectId", projectId),
      )
      .order("desc")
      .take(limit);
    return revisions.map(toStudioEditorProjectRevisionRecord);
  },
});
