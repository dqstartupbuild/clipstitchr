import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { getHookLabCreativeBriefForOwner } from "./getHookLabCreativeBriefForOwner";
import { rateLimiter } from "../rateLimiter";
import { getHookLabCreativeBriefIsComplete } from "./getHookLabCreativeBriefIsComplete";

export const approve = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existing = await getHookLabCreativeBriefForOwner(ctx, ownerId, id);

    if (!existing) {
      throw new Error("Creative brief not found.");
    }

    if (!getHookLabCreativeBriefIsComplete(existing.brief)) {
      throw new Error("Complete every brief section before opening a tool.");
    }

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const fields = {
      status: "approved" as const,
      updatedAt: new Date().toISOString(),
    };

    await ctx.db.patch(existing._id, fields);

    return { ...existing, ...fields };
  },
});
