import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertProductBelongsToOwner } from "../assertProductBelongsToOwner";
import { rateLimiter } from "../rateLimiter";

export const setProductSocialAccounts = mutation({
  args: {
    productId: v.string(),
    accountIds: v.array(v.string()),
    now: v.string(),
  },
  handler: async (ctx, { productId, accountIds, now }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });
    await assertProductBelongsToOwner(ctx, ownerId, productId);

    const uniqueAccountIds = Array.from(new Set(accountIds));
    const accounts = await Promise.all(
      uniqueAccountIds.map((accountId) =>
        ctx.db
          .query("socialAccounts")
          .withIndex("by_owner_id", (index) =>
            index.eq("ownerId", ownerId).eq("id", accountId),
          )
          .unique(),
      ),
    );

    if (
      accounts.some(
        (account) => !account || account.status !== "connected",
      )
    ) {
      throw new Error("Choose only connected TikTok or Instagram accounts.");
    }

    const existing = await ctx.db
      .query("productSocialAccounts")
      .withIndex("by_owner_product", (index) =>
        index.eq("ownerId", ownerId).eq("productId", productId),
      )
      .collect();

    for (const association of existing) {
      await ctx.db.delete(association._id);
    }

    for (const account of accounts) {
      if (!account) {
        continue;
      }

      await ctx.db.insert("productSocialAccounts", {
        ownerId,
        productId,
        socialAccountId: account.id,
        platform: account.platform,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return uniqueAccountIds;
  },
});
