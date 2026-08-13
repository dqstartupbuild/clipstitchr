import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioEditorActiveProduct } from "./assertStudioEditorActiveProduct";
import { assertStudioEditorBoundedString } from "./assertStudioEditorBoundedString";
import { toStudioEditorProjectSummary } from "./toStudioEditorProjectSummary";

export const list = query({
  args: {
    productId: v.string(),
    includeArchived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productId = assertStudioEditorBoundedString(args.productId, {
      label: "Product ID",
      maxLength: 120,
    });
    await assertStudioBetaAccess(ctx, ownerId);
    await assertStudioEditorActiveProduct(ctx, ownerId, productId);
    const limit = Math.max(1, Math.min(100, Math.floor(args.limit ?? 30)));
    const projects = args.includeArchived
      ? await ctx.db
          .query("studioEditorProjects")
          .withIndex("by_owner_product_updated", (index) =>
            index.eq("ownerId", ownerId).eq("productId", productId),
          )
          .order("desc")
          .take(limit)
      : await ctx.db
          .query("studioEditorProjects")
          .withIndex("by_owner_product_status_updated", (index) =>
            index
              .eq("ownerId", ownerId)
              .eq("productId", productId)
              .eq("status", "active"),
          )
          .order("desc")
          .take(limit);
    return projects.map(toStudioEditorProjectSummary);
  },
});
