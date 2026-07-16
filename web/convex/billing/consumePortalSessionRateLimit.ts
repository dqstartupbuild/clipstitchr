import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const consumePortalSessionRateLimit = internalMutation({
  args: { ownerId: v.string() },
  handler: async (ctx, { ownerId }) => {
    await rateLimiter.limit(ctx, "stripePortalSession", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "stripePortalSessionGlobal", {
      throws: true,
    });
  },
});
