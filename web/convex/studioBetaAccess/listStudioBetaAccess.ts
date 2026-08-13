import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertStudioBetaOperatorSecret } from "../auth/assertStudioBetaOperatorSecret";
import { consumeStudioBetaAdminRateLimits } from "./consumeStudioBetaAdminRateLimits";
import { getStudioBetaPreferenceForOwner } from "./getStudioBetaPreferenceForOwner";

export const listStudioBetaAccess = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    assertStudioBetaOperatorSecret(secret);
    await consumeStudioBetaAdminRateLimits(ctx, "list");

    const grants = await ctx.db.query("studioBetaAccessGrants").take(500);
    const rows = await Promise.all(
      grants.map(async (grant) => {
        const preference = await getStudioBetaPreferenceForOwner(
          ctx,
          grant.ownerId,
        );

        return {
          enabled: preference?.enabled === true,
          grantedAt: grant.grantedAt,
          ownerId: grant.ownerId,
          revokedAt: grant.revokedAt,
          status: grant.status,
          updatedAt: grant.updatedAt,
        };
      }),
    );

    return rows.toSorted((left, right) =>
      left.ownerId.localeCompare(right.ownerId),
    );
  },
});
