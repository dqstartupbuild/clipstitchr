import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";
import { createHookLabIdeaSearchText } from "../hookLabIdeas/createHookLabIdeaSearchText";
import { createHookLabStitchRecipeFromTemplate } from "./createHookLabStitchRecipeFromTemplate";
import { createMigratedHookLabCreativeBeat } from "./createMigratedHookLabCreativeBeat";
import { createMigratedHookLabTextBlueprint } from "./createMigratedHookLabTextBlueprint";
import { getHookLabTemplateOriginalText } from "./getHookLabTemplateOriginalText";

export const migrateStitchTemplatesToHookLabIdeas = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);
    const page = await ctx.db
      .query("stitchTemplates")
      .paginate({ ...paginationOpts, numItems: Math.min(50, paginationOpts.numItems) });
    let createdCount = 0;

    for (const template of page.page) {
      const migrationKey = `template:${template.id}`;
      const existing = await ctx.db
        .query("hookLabIdeas")
        .withIndex("by_owner_migration_key", (index) =>
          index.eq("ownerId", template.ownerId).eq("migrationKey", migrationKey),
        )
        .unique();

      if (existing) {
        continue;
      }

      const sourceStitch = await ctx.db
        .query("stitches")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", template.ownerId).eq("id", template.sourceStitchId),
        )
        .unique();
      const sourceUgcClip = await ctx.db
        .query("videoClips")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", template.ownerId).eq("id", template.ugcClipId),
        )
        .unique();
      const originalText = getHookLabTemplateOriginalText(template) ?? template.name;
      const id = `hook-lab-idea:template:${template.ownerId}:${template.id}`;
      const textBlueprint = createMigratedHookLabTextBlueprint(originalText);
      const whatToRepeat =
        "The saved hook, opening rhythm, and smooth handoff into the Demo.";

      await ctx.db.insert("hookLabIdeas", {
        ownerId: template.ownerId,
        id,
        name: template.name,
        searchText: createHookLabIdeaSearchText([
          template.name,
          originalText,
          template.sourceStitchName,
          whatToRepeat,
        ]),
        sortKey: `${template.createdAt}:${id}`,
        status: "ready",
        sourceType: "migrated_template",
        scope: sourceStitch?.productId ? "product" : "shared",
        productId: sourceStitch?.productId,
        originalText,
        textBlueprint,
        creativeBeat: createMigratedHookLabCreativeBeat(sourceUgcClip),
        stitchRecipe: createHookLabStitchRecipeFromTemplate({
          sourceStitch,
          template,
        }),
        sourceStitchId: template.sourceStitchId,
        sourceTemplateId: template.id,
        whatToRepeat,
        useCount: 0,
        migrationKey,
        promptVersion: "template-migration-v1",
        analysisVersion: "template-migration-v1",
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      });
      createdCount += 1;
    }

    return {
      continueCursor: page.continueCursor,
      createdCount,
      isDone: page.isDone,
      processedCount: page.page.length,
    };
  },
});
