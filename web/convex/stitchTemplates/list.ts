import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";

const STITCH_TEMPLATE_LIST_LIMIT = 200;

export const list = query({
  args: {
    sortOrder: v.optional(v.union(v.literal("newest"), v.literal("oldest"))),
  },
  handler: async (ctx, { sortOrder }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const [ideas, templates] = await Promise.all([
      ctx.db
        .query("hookLabIdeas")
        .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
        .order(sortOrder === "oldest" ? "asc" : "desc")
        .take(STITCH_TEMPLATE_LIST_LIMIT),
      ctx.db
        .query("stitchTemplates")
        .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
        .order(sortOrder === "oldest" ? "asc" : "desc")
        .take(STITCH_TEMPLATE_LIST_LIMIT),
    ]);
    const recipeIdeas = ideas
      .filter((idea) => idea.stitchRecipe && idea.status !== "archived")
      .map((idea) => ({
        id: idea.id,
        name: idea.name,
        sourceStitchId:
          idea.sourceStitchId ?? idea.stitchRecipe!.ugcClipId,
        sourceStitchName: idea.name,
        ...idea.stitchRecipe!,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      }));
    const migratedTemplateIds = new Set(
      ideas
        .map((idea) => idea.sourceTemplateId)
        .filter((id): id is string => Boolean(id)),
    );
    const legacyFallbacks = templates.filter(
      (template) => !migratedTemplateIds.has(template.id),
    );

    return [...recipeIdeas, ...legacyFallbacks]
      .sort((left, right) =>
        sortOrder === "oldest"
          ? left.createdAt.localeCompare(right.createdAt)
          : right.createdAt.localeCompare(left.createdAt),
      )
      .slice(0, STITCH_TEMPLATE_LIST_LIMIT);
  },
});
