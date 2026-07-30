import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { socialPlatformValidator } from "../validators/socialPlatform";

export const recordSocialWebhookEvent = mutation({
  args: {
    secret: v.string(),
    platform: socialPlatformValidator,
    id: v.string(),
    externalEventId: v.string(),
    eventType: v.string(),
    externalAccountId: v.optional(v.string()),
    signatureTimestamp: v.optional(v.string()),
    payloadHash: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);

    const [existingById, existingByPayload] = await Promise.all([
      ctx.db
        .query("socialWebhookEvents")
        .withIndex("by_platform_external_event", (index) =>
          index
            .eq("platform", args.platform)
            .eq("externalEventId", args.externalEventId),
        )
        .unique(),
      ctx.db
        .query("socialWebhookEvents")
        .withIndex("by_platform_payload_hash", (index) =>
          index
            .eq("platform", args.platform)
            .eq("payloadHash", args.payloadHash),
        )
        .unique(),
    ]);

    const existing = existingById ?? existingByPayload;

    if (existing) {
      return {
        duplicate: true,
        disposition: existing.disposition,
        id: existing.id,
      };
    }

    await ctx.db.insert("socialWebhookEvents", {
      platform: args.platform,
      id: args.id,
      externalEventId: args.externalEventId,
      eventType: args.eventType,
      externalAccountId: args.externalAccountId,
      signatureTimestamp: args.signatureTimestamp,
      payloadHash: args.payloadHash,
      disposition: "received",
      receivedAt: args.now,
    });

    return {
      duplicate: false,
      disposition: "received" as const,
      id: args.id,
    };
  },
});
