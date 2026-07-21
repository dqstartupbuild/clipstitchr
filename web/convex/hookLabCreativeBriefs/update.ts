import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { hookLabCreativeBriefContentValidator } from "../validators/hookLabCreativeBriefContent";
import { getHookLabCreativeBriefForOwner } from "./getHookLabCreativeBriefForOwner";
import { normalizeHookLabCreativeBriefContent } from "./normalizeHookLabCreativeBriefContent";
import { rateLimiter } from "../rateLimiter";

export const update = mutation({
  args: {
    brief: hookLabCreativeBriefContentValidator,
    id: v.string(),
  },
  handler: async (ctx, { brief, id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existing = await getHookLabCreativeBriefForOwner(ctx, ownerId, id);

    if (!existing) {
      throw new Error("Creative brief not found.");
    }

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const fields = {
      brief: normalizeHookLabCreativeBriefContent(brief),
      status: "draft" as const,
      updatedAt: new Date().toISOString(),
    };

    await ctx.db.patch(existing._id, fields);

    return { ...existing, ...fields };
  },
});
