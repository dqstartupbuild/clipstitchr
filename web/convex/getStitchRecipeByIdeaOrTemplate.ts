import type { QueryCtx } from "./_generated/server";

export async function getStitchRecipeByIdeaOrTemplate(
  ctx: QueryCtx,
  ownerId: string,
  id: string,
) {
  const directIdea = await ctx.db
    .query("hookLabIdeas")
    .withIndex("by_owner_id", (index) =>
      index.eq("ownerId", ownerId).eq("id", id),
    )
    .unique();
  const migratedIdea = directIdea?.stitchRecipe
    ? null
    : await ctx.db
        .query("hookLabIdeas")
        .withIndex("by_owner_source_template", (index) =>
          index.eq("ownerId", ownerId).eq("sourceTemplateId", id),
        )
        .unique();
  const idea = directIdea?.stitchRecipe ? directIdea : migratedIdea;

  if (idea?.stitchRecipe) {
    return {
      id: directIdea?.stitchRecipe ? idea.id : id,
      name: idea.name,
      sourceStitchId: idea.sourceStitchId ?? idea.stitchRecipe.ugcClipId,
      sourceStitchName: idea.name,
      ...idea.stitchRecipe,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt,
    };
  }

  return await ctx.db
    .query("stitchTemplates")
    .withIndex("by_owner_id", (index) =>
      index.eq("ownerId", ownerId).eq("id", id),
    )
    .unique();
}
