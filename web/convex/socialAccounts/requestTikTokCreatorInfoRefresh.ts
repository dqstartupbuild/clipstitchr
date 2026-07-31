import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertOwnerCanPublishSocial } from "../billing/assertOwnerCanPublishSocial";
import { rateLimiter } from "../rateLimiter";
import { enqueueSocialTargetProviderJob } from "../socialPublishing/enqueueSocialTargetProviderJob";

export const requestTikTokCreatorInfoRefresh = mutation({
  args: {
    id: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    const account = await ctx.db
      .query("socialAccounts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    if (
      !account ||
      account.platform !== "tiktok" ||
      account.status !== "connected"
    ) {
      throw new Error("Reconnect TikTok before loading posting choices.");
    }

    await assertOwnerCanPublishSocial(ctx, ownerId, args.now);
    await rateLimiter.limit(ctx, "socialCapabilityRefresh", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "socialCapabilityRefreshGlobal", {
      throws: true,
    });
    await ctx.db.patch(account._id, {
      capabilitySnapshotJson: undefined,
      capabilityCheckedAt: undefined,
      lastErrorCode: undefined,
      lastErrorMessage: undefined,
      updatedAt: args.now,
    });

    const idempotencyKey = `social-capability:${account.id}:${args.now}`;
    const job = await enqueueSocialTargetProviderJob(ctx, {
      idempotencyKey,
      inputSnapshotJson: JSON.stringify({ accountId: account.id }),
      jobId: `provider:${idempotencyKey}`,
      jobType: "social-capability-refresh",
      now: args.now,
      ownerId,
    });

    return { queued: true, providerJobId: job.id };
  },
});
