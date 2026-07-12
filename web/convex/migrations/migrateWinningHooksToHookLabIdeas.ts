import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";
import { createHookLabIdeaSearchText } from "../hookLabIdeas/createHookLabIdeaSearchText";
import { createMigratedHookLabCreativeBeat } from "./createMigratedHookLabCreativeBeat";
import { createMigratedHookLabTextBlueprint } from "./createMigratedHookLabTextBlueprint";

export const migrateWinningHooksToHookLabIdeas = mutation({
  args: {
    paginationOpts: paginationOptsValidator,
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);
    const page = await ctx.db
      .query("products")
      .paginate({ ...paginationOpts, numItems: Math.min(50, paginationOpts.numItems) });
    let createdCount = 0;

    for (const product of page.page) {
      for (const [index, value] of (product.winningHookExamples ?? []).entries()) {
        const sourceText = value.trim().replace(/\s+/g, " ").slice(0, 240);

        if (!sourceText) {
          continue;
        }

        const migrationKey = `winning-hook:${product.id}:${index}`;
        const existing = await ctx.db
          .query("hookLabIdeas")
          .withIndex("by_owner_migration_key", (query) =>
            query.eq("ownerId", product.ownerId).eq("migrationKey", migrationKey),
          )
          .unique();

        if (existing) {
          continue;
        }

        const id = `hook-lab-idea:winner:${product.ownerId}:${product.id}:${index}`;
        const whatToRepeat =
          "The hook's emotional pattern, filled with details that fit this product.";

        await ctx.db.insert("hookLabIdeas", {
          ownerId: product.ownerId,
          id,
          name: sourceText.slice(0, 64),
          searchText: createHookLabIdeaSearchText([
            sourceText,
            product.name,
            whatToRepeat,
          ]),
          sortKey: `${product.updatedAt}:${id}`,
          status: "ready",
          sourceType: "text",
          scope: "product",
          productId: product.id,
          originalText: sourceText,
          textBlueprint: createMigratedHookLabTextBlueprint(sourceText),
          creativeBeat: createMigratedHookLabCreativeBeat(null),
          whatToRepeat,
          useCount: 0,
          migrationKey,
          promptVersion: "winning-hook-migration-v1",
          analysisVersion: "winning-hook-migration-v1",
          createdAt: product.updatedAt,
          updatedAt: product.updatedAt,
        });
        createdCount += 1;
      }
    }

    return {
      continueCursor: page.continueCursor,
      createdCount,
      isDone: page.isDone,
      processedCount: page.page.length,
    };
  },
});
