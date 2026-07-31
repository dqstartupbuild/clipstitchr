import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";

export const releaseSocialTokenRefreshLock = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    lockId: v.string(),
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

    if (!account || account.tokenRefreshLockId !== args.lockId) {
      return false;
    }

    await ctx.db.patch(account._id, {
      tokenRefreshLockId: undefined,
      tokenRefreshLockedUntil: undefined,
      updatedAt: args.now,
    });

    return true;
  },
});
