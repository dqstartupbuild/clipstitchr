import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";
import { createStitchTemplateDocumentFromStitch } from "./createStitchTemplateDocumentFromStitch";

export const createFromStitch = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    stitchId: v.string(),
  },
  handler: async (ctx, { id, name, stitchId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    const [existingTemplate, stitch] = await Promise.all([
      ctx.db
        .query("stitchTemplates")
        .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
        .unique(),
      ctx.db
        .query("stitches")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", stitchId),
        )
        .unique(),
    ]);

    if (existingTemplate) {
      throw new Error("Template already exists.");
    }

    if (!stitch) {
      throw new Error("Stitch not found.");
    }

    return await ctx.db.insert(
      "stitchTemplates",
      createStitchTemplateDocumentFromStitch({
        id,
        name: name.trim() || `${stitch.name} template`,
        now: new Date().toISOString(),
        ownerId,
        stitch,
      }),
    );
  },
});
