import { v } from "convex/values";
import { STUDIO_BETA_OPERATOR_ACTOR_ID } from "../../lib/clipstitchr/constants/studioBetaOperatorActorId";
import { mutation } from "../_generated/server";
import { assertStudioBetaOperatorSecret } from "../auth/assertStudioBetaOperatorSecret";
import { assertStudioBetaOwnerId } from "./assertStudioBetaOwnerId";
import { consumeStudioBetaAdminRateLimits } from "./consumeStudioBetaAdminRateLimits";
import { getStudioBetaAccessGrantForOwner } from "./getStudioBetaAccessGrantForOwner";
import { recordStudioBetaAuditEvent } from "./recordStudioBetaAuditEvent";

export const grantStudioBetaAccess = mutation({
  args: {
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { ownerId, secret }) => {
    assertStudioBetaOperatorSecret(secret);
    assertStudioBetaOwnerId(ownerId);
    await consumeStudioBetaAdminRateLimits(ctx, ownerId);

    const existingGrant = await getStudioBetaAccessGrantForOwner(ctx, ownerId);

    if (existingGrant?.status === "active") {
      return { changed: false, ownerId, status: existingGrant.status };
    }

    const now = new Date().toISOString();

    if (existingGrant) {
      await ctx.db.patch(existingGrant._id, {
        status: "active",
        grantedAt: now,
        grantedBy: STUDIO_BETA_OPERATOR_ACTOR_ID,
        revokedAt: undefined,
        revokedBy: undefined,
        revocationReason: undefined,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("studioBetaAccessGrants", {
        ownerId,
        status: "active",
        grantedAt: now,
        grantedBy: STUDIO_BETA_OPERATOR_ACTOR_ID,
        createdAt: now,
        updatedAt: now,
      });
    }

    await recordStudioBetaAuditEvent(ctx, {
      actorId: STUDIO_BETA_OPERATOR_ACTOR_ID,
      eventType: "access-granted",
      now,
      ownerId,
    });

    return { changed: true, ownerId, status: "active" as const };
  },
});
