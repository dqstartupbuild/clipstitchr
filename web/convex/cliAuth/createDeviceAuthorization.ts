import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const createDeviceAuthorization = mutation({
  args: {
    clientKey: v.string(),
    clientName: v.optional(v.string()),
    createdAt: v.string(),
    deviceCodeHash: v.string(),
    expiresAt: v.string(),
    id: v.string(),
    machineName: v.optional(v.string()),
    secret: v.string(),
    userCode: v.string(),
  },
  handler: async (
    ctx,
    {
      clientKey,
      clientName,
      createdAt,
      deviceCodeHash,
      expiresAt,
      id,
      machineName,
      secret,
      userCode,
    },
  ) => {
    assertRateLimitApiSecret(secret);

    await rateLimiter.limit(ctx, "cliDeviceAuthorizationByClient", {
      key: clientKey,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliDeviceAuthorizationGlobal", {
      throws: true,
    });

    const existingUserCode = await ctx.db
      .query("cliDeviceAuthorizations")
      .withIndex("by_user_code", (q) => q.eq("userCode", userCode))
      .unique();

    if (existingUserCode?.status === "pending") {
      throw new Error("Could not create a sign-in code. Please try again.");
    }

    await ctx.db.insert("cliDeviceAuthorizations", {
      clientName,
      createdAt,
      deviceCodeHash,
      expiresAt,
      id,
      machineName,
      status: "pending",
      updatedAt: createdAt,
      userCode,
    });
  },
});
