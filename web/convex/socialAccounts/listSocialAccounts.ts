import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";

export const listSocialAccounts = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const accounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_owner", (index) => index.eq("ownerId", ownerId))
      .collect();

    return accounts.map((account) => ({
      id: account.id,
      platform: account.platform,
      username: account.username,
      displayName: account.displayName,
      avatarUrl: account.avatarUrl,
      accountType: account.accountType,
      status: account.status,
      scopes: account.scopes,
      capabilitySnapshotJson: account.capabilitySnapshotJson,
      capabilityCheckedAt: account.capabilityCheckedAt,
      lastErrorMessage: account.lastErrorMessage,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }));
  },
});
