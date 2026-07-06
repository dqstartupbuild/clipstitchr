import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

function getPositiveCount(value: number, label: string) {
  const count = Math.ceil(value);

  if (!Number.isFinite(count) || count <= 0) {
    throw new Error(`${label} must be greater than zero.`);
  }

  return count;
}

export const consumeCliPostBridgeMediaUpload = mutation({
  args: {
    mediaSizeBytes: v.number(),
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { mediaSizeBytes, ownerId, secret }) => {
    assertRateLimitApiSecret(secret);

    const uploadBytes = getPositiveCount(mediaSizeBytes, "Media size");

    await rateLimiter.limit(ctx, "postBridgeUploadBytesDaily", {
      count: uploadBytes,
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "postBridgeUploadBytesGlobalDaily", {
      count: uploadBytes,
      throws: true,
    });
  },
});
