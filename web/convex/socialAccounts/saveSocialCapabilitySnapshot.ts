import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";

export const saveSocialCapabilitySnapshot = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    capabilitySnapshotJson: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
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

    if (!account) {
      throw new Error("Connected social account not found.");
    }

    await ctx.db.patch(account._id, {
      capabilitySnapshotJson: args.capabilitySnapshotJson,
      capabilityCheckedAt: args.now,
      displayName: args.displayName ?? account.displayName,
      avatarUrl: args.avatarUrl ?? account.avatarUrl,
      status:
        account.status === "needs_attention" ? "connected" : account.status,
      lastErrorCode:
        account.status === "needs_attention"
          ? undefined
          : account.lastErrorCode,
      lastErrorMessage:
        account.status === "needs_attention"
          ? undefined
          : account.lastErrorMessage,
      updatedAt: args.now,
    });
  },
});
