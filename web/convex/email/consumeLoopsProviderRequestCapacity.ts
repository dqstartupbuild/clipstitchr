import { internalMutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const consumeLoopsProviderRequestCapacity = internalMutation({
  args: {},
  handler: async (ctx) =>
    await rateLimiter.limit(ctx, "loopsProviderRequest"),
});
