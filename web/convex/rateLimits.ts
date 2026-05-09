import { v } from "convex/values";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";

function getPositiveCount(count: number, name: string) {
  if (!Number.isFinite(count) || count <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }

  return Math.ceil(count);
}

async function getOwnedSwaprJob(
  ctx: MutationCtx,
  ownerId: string,
  predictionId: string,
) {
  const job = await ctx.db
    .query("replicateJobs")
    .withIndex("by_owner_prediction", (q) =>
      q.eq("ownerId", ownerId).eq("predictionId", predictionId),
    )
    .unique();

  if (!job || job.purpose !== "swapr-video") {
    throw new Error("Swapr job not found.");
  }

  return job;
}

export const consumeR2Upload = mutation({
  args: {
    secret: v.string(),
    sizeBytes: v.number(),
  },
  handler: async (ctx, { secret, sizeBytes }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const uploadBytes = getPositiveCount(sizeBytes, "Upload size");

    await rateLimiter.limit(ctx, "r2UploadUrl", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "r2UploadBytes", {
      key: ownerId,
      count: uploadBytes,
      throws: true,
    });
    await rateLimiter.limit(ctx, "r2UploadBytesMonthly", {
      key: ownerId,
      count: uploadBytes,
      throws: true,
    });
  },
});

export const consumeR2Download = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "r2DownloadUrl", {
      key: ownerId,
      throws: true,
    });
  },
});

export const consumeR2Delete = mutation({
  args: {
    secret: v.string(),
    objectCount: v.number(),
  },
  handler: async (ctx, { secret, objectCount }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const deleteCount = getPositiveCount(objectCount, "Object count");

    await rateLimiter.limit(ctx, "r2DeleteObjects", {
      key: ownerId,
      count: deleteCount,
      throws: true,
    });
  },
});

export const consumeUploadAnalysis = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "replicateUploadAnalysis", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateUploadAnalysisMonthly", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateUploadAnalysisGlobal", {
      throws: true,
    });
  },
});

export const consumeSwaprPhotoExpand = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "replicateSwaprPhotoExpand", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateSwaprPhotoExpandDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateSwaprPhotoExpandMonthly", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateSwaprPhotoExpandGlobal", {
      throws: true,
    });
  },
});

export const consumeSwaprJobCreate = mutation({
  args: {
    estimatedSeconds: v.number(),
    secret: v.string(),
  },
  handler: async (ctx, { estimatedSeconds, secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const generatedSeconds = getPositiveCount(
      estimatedSeconds,
      "Estimated generated seconds",
    );

    await rateLimiter.limit(ctx, "replicateSwaprJobCreate", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateSwaprJobCreateDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateSwaprGeneratedSecondsMonthly", {
      key: ownerId,
      count: generatedSeconds,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateSwaprJobCreateGlobal", {
      throws: true,
    });
  },
});

export const consumeSwaprJobPoll = mutation({
  args: {
    secret: v.string(),
    predictionId: v.string(),
  },
  handler: async (ctx, { secret, predictionId }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await getOwnedSwaprJob(ctx, ownerId, predictionId);
    await rateLimiter.limit(ctx, "replicateSwaprJobPoll", {
      key: ownerId,
      throws: true,
    });
  },
});

export const consumeSwaprJobCancel = mutation({
  args: {
    secret: v.string(),
    predictionId: v.string(),
  },
  handler: async (ctx, { secret, predictionId }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await getOwnedSwaprJob(ctx, ownerId, predictionId);
    await rateLimiter.limit(ctx, "replicateSwaprJobCancel", {
      key: ownerId,
      throws: true,
    });
  },
});

export const consumeSwaprOutputDownload = mutation({
  args: {
    secret: v.string(),
    predictionId: v.string(),
    outputUrl: v.string(),
  },
  handler: async (ctx, { secret, predictionId, outputUrl }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const job = await getOwnedSwaprJob(ctx, ownerId, predictionId);

    if (!job.outputUrl || job.outputUrl !== outputUrl) {
      throw new Error("Swapr output not found.");
    }

    await rateLimiter.limit(ctx, "replicateSwaprOutputDownload", {
      key: ownerId,
      throws: true,
    });
  },
});

export const consumeAvatarPhotoGenerate = mutation({
  args: {
    count: v.number(),
    secret: v.string(),
  },
  handler: async (ctx, { count, secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const imageCount = getPositiveCount(count, "Image count");

    await rateLimiter.limit(ctx, "replicateAvatarPhotoGenerate", {
      key: ownerId,
      count: imageCount,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateAvatarPhotoGenerateDaily", {
      key: ownerId,
      count: imageCount,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateAvatarPhotoGenerateMonthly", {
      key: ownerId,
      count: imageCount,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateAvatarPhotoGenerateGlobal", {
      count: imageCount,
      throws: true,
    });
  },
});
