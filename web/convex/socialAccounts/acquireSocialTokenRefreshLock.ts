import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";

export const acquireSocialTokenRefreshLock = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    lockId: v.string(),
    lockedUntil: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    const account = await ctx.db
      .query("socialAccounts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id),
      )
      .unique();

    if (
      !account ||
      !["connected", "needs_attention"].includes(account.status)
    ) {
      return false;
    }

    if (
      account.tokenRefreshLockedUntil &&
      Date.parse(account.tokenRefreshLockedUntil) > Date.parse(args.now) &&
      account.tokenRefreshLockId !== args.lockId
    ) {
      return false;
    }

    await ctx.db.patch(account._id, {
      tokenRefreshLockId: args.lockId,
      tokenRefreshLockedUntil: args.lockedUntil,
      updatedAt: args.now,
    });

    return true;
  },
});
