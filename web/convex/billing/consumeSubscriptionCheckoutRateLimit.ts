import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const consumeSubscriptionCheckoutRateLimit = internalMutation({
  args: { ownerId: v.string() },
  handler: async (ctx, { ownerId }) => {
    await rateLimiter.limit(ctx, "stripeSubscriptionCheckout", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "stripeSubscriptionCheckoutGlobal", {
      throws: true,
    });
  },
});
