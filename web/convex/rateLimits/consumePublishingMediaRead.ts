import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { consumePublishingMediaReadLimits } from "./consumePublishingMediaReadLimits";

export const consumePublishingMediaRead = mutation({
  args: {
    grantKey: v.string(),
    quotaIdentity: v.string(),
    readBytes: v.number(),
    secret: v.string(),
  },
  handler: async (ctx, { grantKey, quotaIdentity, readBytes, secret }) => {
    assertRateLimitApiSecret(secret);

    await consumePublishingMediaReadLimits(ctx, {
      grantKey,
      quotaIdentity,
      readBytes,
    });
  },
});
