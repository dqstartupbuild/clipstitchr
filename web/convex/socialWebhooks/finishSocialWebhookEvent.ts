import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { socialWebhookDispositionValidator } from "../validators/socialWebhookDisposition";

export const finishSocialWebhookEvent = mutation({
  args: {
    secret: v.string(),
    id: v.string(),
    disposition: socialWebhookDispositionValidator,
    errorMessage: v.optional(v.string()),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);

    const event = await ctx.db
      .query("socialWebhookEvents")
      .withIndex("by_event_id", (index) => index.eq("id", args.id))
      .unique();

    if (!event) {
      return false;
    }

    await ctx.db.patch(event._id, {
      disposition: args.disposition,
      errorMessage: args.errorMessage,
      processedAt: args.now,
    });

    return true;
  },
});
