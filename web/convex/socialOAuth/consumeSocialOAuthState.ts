import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { socialPlatformValidator } from "../validators/socialPlatform";

export const consumeSocialOAuthState = mutation({
  args: {
    platform: socialPlatformValidator,
    stateHash: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const state = await ctx.db
      .query("socialOAuthStates")
      .withIndex("by_state_hash", (index) =>
        index.eq("stateHash", args.stateHash),
      )
      .unique();

    if (
      !state ||
      state.ownerId !== ownerId ||
      state.platform !== args.platform ||
      state.status !== "pending" ||
      Date.parse(state.expiresAt) <= Date.parse(args.now)
    ) {
      throw new Error("This connection link expired. Start again.");
    }

    await ctx.db.patch(state._id, {
      status: "consumed",
      consumedAt: args.now,
      updatedAt: args.now,
    });

    return {
      redirectUri: state.redirectUri,
      returnPath: state.returnPath,
      codeVerifierCiphertext: state.codeVerifierCiphertext,
    };
  },
});
