import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";

export const updateSocialPublishAttemptStage = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    stage: v.string(),
    providerRequestId: v.optional(v.string()),
    providerPublishId: v.optional(v.string()),
    providerContainerId: v.optional(v.string()),
    providerResponseJson: v.optional(v.string()),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    const attempt = await ctx.db
      .query("socialPublishAttempts")
      .withIndex("by_owner_target", (index) =>
        index.eq("ownerId", args.ownerId),
      )
      .filter((query) => query.eq(query.field("id"), args.id))
      .first();

    if (!attempt) {
      throw new Error("Social publishing attempt not found.");
    }

    await ctx.db.patch(attempt._id, {
      stage: args.stage,
      retrySafety:
        args.providerPublishId || args.providerContainerId
          ? "status_only"
          : attempt.retrySafety,
      providerRequestId: args.providerRequestId ?? attempt.providerRequestId,
      providerPublishId: args.providerPublishId ?? attempt.providerPublishId,
      providerContainerId:
        args.providerContainerId ?? attempt.providerContainerId,
      providerResponseJson:
        args.providerResponseJson ?? attempt.providerResponseJson,
      updatedAt: args.now,
    });
  },
});
