import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { query } from "../_generated/server";

export const getHookLabMigrationStatus = query({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);
    const [templates, migratedTemplateIdeas, hookPlans, hookOptions] =
      await Promise.all([
        ctx.db.query("stitchTemplates").take(10000),
        ctx.db
          .query("hookLabIdeas")
          .filter((filter) =>
            filter.eq(filter.field("sourceType"), "migrated_template"),
          )
          .take(10000),
        ctx.db.query("stitchrHookPlans").take(10000),
        ctx.db.query("stitchrHookOptions").take(10000),
      ]);
    const expectedHookOptionCount = hookPlans.reduce(
      (count, plan) => count + plan.hookOptions.length,
      0,
    );

    return {
      expectedHookOptionCount,
      hookOptionCount: hookOptions.length,
      hookPlanCount: hookPlans.length,
      migratedTemplateIdeaCount: migratedTemplateIdeas.length,
      missingTemplateRecipeCount: migratedTemplateIdeas.filter(
        (idea) => !idea.stitchRecipe,
      ).length,
      templateCount: templates.length,
      templateCountsMatch: templates.length === migratedTemplateIdeas.length,
    };
  },
});
