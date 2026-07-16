import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const consumeRefillCheckoutRateLimit = internalMutation({
  args: { ownerId: v.string() },
  handler: async (ctx, { ownerId }) => {
    await rateLimiter.limit(ctx, "stripeRefillCheckout", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "stripeRefillCheckoutGlobal", {
      throws: true,
    });
  },
});
