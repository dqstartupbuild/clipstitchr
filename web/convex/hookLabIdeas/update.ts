import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";
import { hookLabIdeaScopeValidator } from "../validators/hookLabIdeaScope";
import { createHookLabIdeaSearchText } from "./createHookLabIdeaSearchText";

export const update = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    productId: v.optional(v.string()),
    scope: v.optional(hookLabIdeaScopeValidator),
    updatedAt: v.string(),
    whatToRepeat: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const idea = await ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", ownerId).eq("id", args.id.trim()),
      )
      .unique();

    if (!idea) {
      throw new Error("Idea not found.");
    }

    const scope = args.scope ?? idea.scope;
    const productId =
      scope === "product"
        ? (args.productId?.trim() || idea.productId)
        : undefined;

    if (scope === "product") {
      const product = productId
        ? await ctx.db
            .query("products")
            .withIndex("by_owner_id", (query) =>
              query.eq("ownerId", ownerId).eq("id", productId),
            )
            .unique()
        : null;

      if (!product) {
        throw new Error("Choose one of your products for this idea.");
      }
    }

    const name = args.name?.trim().replace(/\s+/g, " ").slice(0, 120) || idea.name;
    const whatToRepeat =
      args.whatToRepeat?.trim().replace(/\s+/g, " ").slice(0, 500) ||
      idea.whatToRepeat;

    await ctx.db.patch(idea._id, {
      name,
      scope,
      productId,
      whatToRepeat,
      searchText: createHookLabIdeaSearchText([
        name,
        idea.originalText,
        whatToRepeat,
        idea.attributionName,
      ]),
      updatedAt: args.updatedAt,
    });

    return idea.id;
  },
});
