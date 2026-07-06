import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { query } from "../_generated/server";

export const getCliUploadStatus = query({
  args: {
    clipId: v.string(),
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { clipId, ownerId, secret }) => {
    assertRateLimitApiSecret(secret);

    const [clip, job] = await Promise.all([
      ctx.db
        .query("videoClipCards")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", clipId),
        )
        .unique(),
      ctx.db
        .query("mediaJobs")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", `media:upload-normalization:${clipId}`),
        )
        .unique(),
    ]);

    return {
      clip: clip
        ? {
            createdAt: clip.createdAt,
            duration: clip.duration,
            id: clip.id,
            name: clip.name,
            productId: clip.productId,
            updatedAt: clip.updatedAt,
          }
        : null,
      job: job
        ? {
            completedAt: job.completedAt,
            createdAt: job.createdAt,
            error: job.error,
            id: job.id,
            stage: job.stage,
            status: job.status,
            updatedAt: job.updatedAt,
          }
        : null,
    };
  },
});
