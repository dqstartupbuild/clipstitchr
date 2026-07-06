import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const exchangeDeviceAuthorization = mutation({
  args: {
    clientKey: v.string(),
    deviceCodeHash: v.string(),
    exchangedAt: v.string(),
    secret: v.string(),
    sessionExpiresAt: v.string(),
    sessionId: v.string(),
    sessionTokenHash: v.string(),
  },
  handler: async (
    ctx,
    {
      clientKey,
      deviceCodeHash,
      exchangedAt,
      secret,
      sessionExpiresAt,
      sessionId,
      sessionTokenHash,
    },
  ) => {
    assertRateLimitApiSecret(secret);

    await rateLimiter.limit(ctx, "cliDeviceTokenExchangeByClient", {
      key: clientKey,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliDeviceTokenExchangeGlobal", {
      throws: true,
    });

    const authorization = await ctx.db
      .query("cliDeviceAuthorizations")
      .withIndex("by_device_code_hash", (q) =>
        q.eq("deviceCodeHash", deviceCodeHash),
      )
      .unique();

    if (!authorization) {
      return { status: "invalid_request" as const };
    }

    if (authorization.expiresAt <= exchangedAt) {
      await ctx.db.patch(authorization._id, {
        status: "expired",
        updatedAt: exchangedAt,
      });

      return { status: "expired_token" as const };
    }

    if (authorization.status === "pending") {
      return { status: "authorization_pending" as const };
    }

    if (authorization.status !== "approved" || !authorization.ownerId) {
      return { status: "expired_token" as const };
    }

    await ctx.db.insert("cliSessions", {
      clientName: authorization.clientName,
      createdAt: exchangedAt,
      expiresAt: sessionExpiresAt,
      id: sessionId,
      machineName: authorization.machineName,
      ownerId: authorization.ownerId,
      tokenHash: sessionTokenHash,
      updatedAt: exchangedAt,
    });

    await ctx.db.patch(authorization._id, {
      consumedAt: exchangedAt,
      sessionId,
      status: "consumed",
      updatedAt: exchangedAt,
    });

    return {
      expiresAt: sessionExpiresAt,
      ownerId: authorization.ownerId,
      sessionId,
      status: "authorized" as const,
    };
  },
});
