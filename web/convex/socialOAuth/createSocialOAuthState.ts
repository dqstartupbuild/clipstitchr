import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertOwnerCanPublishSocial } from "../billing/assertOwnerCanPublishSocial";
import { socialPlatformValidator } from "../validators/socialPlatform";

export const createSocialOAuthState = mutation({
  args: {
    id: v.string(),
    platform: socialPlatformValidator,
    stateHash: v.string(),
    codeVerifierCiphertext: v.optional(v.string()),
    redirectUri: v.string(),
    returnPath: v.string(),
    expiresAt: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await assertOwnerCanPublishSocial(ctx, ownerId, args.now);

    await ctx.db.insert("socialOAuthStates", {
      ownerId,
      id: args.id,
      platform: args.platform,
      stateHash: args.stateHash,
      codeVerifierCiphertext: args.codeVerifierCiphertext,
      redirectUri: args.redirectUri,
      returnPath: args.returnPath,
      status: "pending",
      expiresAt: args.expiresAt,
      createdAt: args.now,
      updatedAt: args.now,
    });
  },
});
