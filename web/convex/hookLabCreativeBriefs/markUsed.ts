import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { hookLabDestinationToolValidator } from "../validators/hookLabDestinationTool";
import { getHookLabCreativeBriefForOwner } from "./getHookLabCreativeBriefForOwner";
import { rateLimiter } from "../rateLimiter";

export const markUsed = mutation({
  args: {
    destinationTool: hookLabDestinationToolValidator,
    id: v.string(),
  },
  handler: async (ctx, { destinationTool, id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existing = await getHookLabCreativeBriefForOwner(ctx, ownerId, id);

    if (!existing || existing.destinationTool !== destinationTool) {
      throw new Error("Creative brief not found for this tool.");
    }

    if (existing.status === "used") {
      return existing;
    }

    if (existing.status !== "approved") {
      throw new Error("Approve this creative brief before using it.");
    }

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const fields = {
      status: "used" as const,
      updatedAt: new Date().toISOString(),
    };

    await ctx.db.patch(existing._id, fields);

    return { ...existing, ...fields };
  },
});
