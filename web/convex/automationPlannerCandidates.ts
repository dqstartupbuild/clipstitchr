import { v } from "convex/values";
import { isSwaprAutomationEnabled } from "../lib/clipstitchr/constants/isSwaprAutomationEnabled";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { query } from "./_generated/server";

export const listEnabled = query({
  args: {
    secret: v.string(),
    cursorOwnerId: v.optional(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, { secret, cursorOwnerId, limit }) => {
    assertAutomationWorkerSecret(secret);

    const cappedLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const preferences = await ctx.db.query("automationPreferences").collect();
    const enabledPreferences = preferences
      .filter((preference) => preference.enabled)
      .filter((preference) =>
        preference.enabledTools.some(
          (tool) => tool !== "swapr" || isSwaprAutomationEnabled,
        ),
      )
      .filter((preference) =>
        cursorOwnerId ? preference.ownerId > cursorOwnerId : true,
      )
      .sort((a, b) => a.ownerId.localeCompare(b.ownerId))
      .slice(0, cappedLimit);

    return {
      preferences: enabledPreferences,
      nextCursorOwnerId:
        enabledPreferences.length === cappedLimit
          ? enabledPreferences[enabledPreferences.length - 1]?.ownerId
          : undefined,
    };
  },
});
