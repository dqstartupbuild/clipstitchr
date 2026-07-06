import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const approveDeviceAuthorization = mutation({
  args: {
    approvedAt: v.string(),
    userCode: v.string(),
  },
  handler: async (ctx, { approvedAt, userCode }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const authorization = await ctx.db
      .query("cliDeviceAuthorizations")
      .withIndex("by_user_code", (q) => q.eq("userCode", userCode))
      .unique();

    if (!authorization) {
      return { status: "not_found" as const };
    }

    if (authorization.expiresAt <= approvedAt) {
      await ctx.db.patch(authorization._id, {
        status: "expired",
        updatedAt: approvedAt,
      });

      return { status: "expired" as const };
    }

    if (authorization.status === "consumed") {
      return { status: "consumed" as const };
    }

    if (authorization.status === "approved") {
      return { status: "approved" as const };
    }

    if (authorization.status !== "pending") {
      return { status: authorization.status };
    }

    await ctx.db.patch(authorization._id, {
      approvedAt,
      ownerId,
      status: "approved",
      updatedAt: approvedAt,
    });

    return { status: "approved" as const };
  },
});
