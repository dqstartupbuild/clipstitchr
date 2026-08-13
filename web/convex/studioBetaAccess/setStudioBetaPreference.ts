import { v } from "convex/values";
import { getStudioBetaGlobalEnabled } from "../../lib/clipstitchr/studio/access/getStudioBetaGlobalEnabled";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { rateLimiter } from "../rateLimiter";
import { getStudioBetaAccessGrantForOwner } from "./getStudioBetaAccessGrantForOwner";
import { getStudioBetaAccessStateForOwner } from "./getStudioBetaAccessStateForOwner";
import { getStudioBetaPreferenceForOwner } from "./getStudioBetaPreferenceForOwner";
import { recordStudioBetaAuditEvent } from "./recordStudioBetaAuditEvent";

export const setStudioBetaPreference = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, { enabled }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const grant = await getStudioBetaAccessGrantForOwner(ctx, ownerId);

    if (!getStudioBetaGlobalEnabled() || grant?.status !== "active") {
      throw new Error("Studio Beta preference is unavailable.");
    }

    await rateLimiter.limit(ctx, "studioBetaPreferenceUpdate", {
      key: ownerId,
      throws: true,
    });

    const existingPreference = await getStudioBetaPreferenceForOwner(
      ctx,
      ownerId,
    );

    if (existingPreference?.enabled === enabled) {
      return await getStudioBetaAccessStateForOwner(ctx, ownerId);
    }

    const now = new Date().toISOString();

    if (existingPreference) {
      await ctx.db.patch(existingPreference._id, { enabled, updatedAt: now });
    } else {
      await ctx.db.insert("studioBetaPreferences", {
        ownerId,
        enabled,
        createdAt: now,
        updatedAt: now,
      });
    }

    await recordStudioBetaAuditEvent(ctx, {
      actorId: ownerId,
      eventType: enabled ? "preference-enabled" : "preference-disabled",
      now,
      ownerId,
    });

    return await getStudioBetaAccessStateForOwner(ctx, ownerId);
  },
});
