import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { createNotification } from "../createNotification";
import { holdFutureTargetsForSocialAccount } from "./holdFutureTargetsForSocialAccount";

export const markSocialAccountNeedsAttentionFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    errorMessage: v.string(),
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
      return;
    }

    await ctx.db.patch(account._id, {
      status: "needs_attention",
      lastErrorCode: "capability_refresh_failed",
      lastErrorMessage: args.errorMessage,
      tokenRefreshLockId: undefined,
      tokenRefreshLockedUntil: undefined,
      updatedAt: args.now,
    });
    await holdFutureTargetsForSocialAccount(ctx, {
      accountId: account.id,
      now: args.now,
      ownerId: args.ownerId,
      reason: "Reconnect this account, then review and resume the post.",
    });
    await createNotification(ctx, {
      ownerId: args.ownerId,
      sourceType: "social-post",
      sourceId: account.id,
      dedupeKey: `social-account-needs-attention:${account.id}:${args.now.slice(0, 10)}`,
      title: `Reconnect ${account.platform === "tiktok" ? "TikTok" : "Instagram"}`,
      preview: "Scheduled posts for this account are on hold.",
      message:
        "Reconnect the account, then review each held post before resuming it.",
      createdAt: args.now,
    });
  },
});
