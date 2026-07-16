import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const consumeAccountEmailProviderCapacity = internalMutation({
  args: { ownerId: v.string() },
  handler: async (ctx, { ownerId }) => {
    const owner = await rateLimiter.limit(
      ctx,
      "accountTransactionalEmailByOwner",
      { key: ownerId },
    );

    if (!owner.ok) {
      return owner;
    }

    return await rateLimiter.limit(ctx, "accountTransactionalEmailGlobal");
  },
});
