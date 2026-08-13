import { v } from "convex/values";
import { STUDIO_BETA_OPERATOR_ACTOR_ID } from "../../lib/clipstitchr/constants/studioBetaOperatorActorId";
import { mutation } from "../_generated/server";
import { assertStudioBetaOperatorSecret } from "../auth/assertStudioBetaOperatorSecret";
import { assertStudioBetaOwnerId } from "./assertStudioBetaOwnerId";
import { consumeStudioBetaAdminRateLimits } from "./consumeStudioBetaAdminRateLimits";
import { getStudioBetaAccessGrantForOwner } from "./getStudioBetaAccessGrantForOwner";
import { recordStudioBetaAuditEvent } from "./recordStudioBetaAuditEvent";

export const revokeStudioBetaAccess = mutation({
  args: {
    ownerId: v.string(),
    reason: v.optional(v.string()),
    secret: v.string(),
  },
  handler: async (ctx, { ownerId, reason, secret }) => {
    assertStudioBetaOperatorSecret(secret);
    assertStudioBetaOwnerId(ownerId);
    await consumeStudioBetaAdminRateLimits(ctx, ownerId);

    if (reason && reason.length > 500) {
      throw new Error("The revocation reason is too long.");
    }

    const existingGrant = await getStudioBetaAccessGrantForOwner(ctx, ownerId);

    if (!existingGrant || existingGrant.status === "revoked") {
      return { changed: false, ownerId, status: "revoked" as const };
    }

    const now = new Date().toISOString();

    await ctx.db.patch(existingGrant._id, {
      status: "revoked",
      revokedAt: now,
      revokedBy: STUDIO_BETA_OPERATOR_ACTOR_ID,
      revocationReason: reason,
      updatedAt: now,
    });
    await recordStudioBetaAuditEvent(ctx, {
      actorId: STUDIO_BETA_OPERATOR_ACTOR_ID,
      eventType: "access-revoked",
      now,
      ownerId,
      reason,
    });

    return { changed: true, ownerId, status: "revoked" as const };
  },
});
