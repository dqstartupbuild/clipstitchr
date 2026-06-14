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

export const consumeTikTokEventsApi = mutation({
  args: {
    key: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { key, secret }) => {
    assertRateLimitApiSecret(secret);

    await rateLimiter.limit(ctx, "tiktokEventsApiByClient", {
      key,
      throws: true,
    });
    await rateLimiter.limit(ctx, "tiktokEventsApiGlobal", {
      throws: true,
    });
  },
});

export const consumeIndexNowSubmit = mutation({
  args: {
    key: v.string(),
    secret: v.string(),
    urlCount: v.number(),
  },
  handler: async (ctx, { key, secret, urlCount }) => {
    assertRateLimitApiSecret(secret);

    const submittedUrlCount = getPositiveCount(urlCount, "URL count");

    await rateLimiter.limit(ctx, "indexNowSubmitUrlsByClient", {
      key,
      count: submittedUrlCount,
      throws: true,
    });
    await rateLimiter.limit(ctx, "indexNowSubmitUrlsGlobal", {
      count: submittedUrlCount,
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

export const consumeUploadVideoAnalysis = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "replicateUploadVideoAnalysis", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateUploadVideoAnalysisMonthly", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateUploadVideoAnalysisGlobal", {
      throws: true,
    });
  },
});

export const consumeStitchScoreAnalysis = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "stitchScoreAnalyze", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "stitchScoreAnalyzeMonthly", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "stitchScoreAnalyzeGlobal", {
      throws: true,
    });
  },
});

export const consumeSwiprBackgroundAnalyze = mutation({
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
    shouldConsumeUserQuota: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { estimatedSeconds, secret, shouldConsumeUserQuota = true },
  ) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const generatedSeconds = getPositiveCount(
      estimatedSeconds,
      "Estimated generated seconds",
    );

    if (shouldConsumeUserQuota) {
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
    }

    await rateLimiter.limit(ctx, "replicateSwaprProviderSegment", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateSwaprProviderSegmentDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateSwaprJobCreateGlobal", {
      throws: true,
    });
  },
});

export const consumeCliprJobCreate = mutation({
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

    await rateLimiter.limit(ctx, "cliprJobCreate", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprJobCreateDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprGeneratedSecondsMonthly", {
      key: ownerId,
      count: generatedSeconds,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprProviderSpendGlobal", {
      throws: true,
    });
  },
});

export const consumeCliprHookScript = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "cliprHookScriptGenerate", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprProviderSpendGlobal", {
      throws: true,
    });
  },
});

export const consumeCliprVoiceGeneration = mutation({
  args: {
    estimatedSeconds: v.number(),
    secret: v.string(),
  },
  handler: async (ctx, { estimatedSeconds, secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const generatedSeconds = getPositiveCount(
      estimatedSeconds,
      "Estimated voice seconds",
    );

    await rateLimiter.limit(ctx, "cliprVoiceGenerate", {
      key: ownerId,
      count: generatedSeconds,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprProviderSpendGlobal", {
      count: generatedSeconds,
      throws: true,
    });
  },
});

export const consumeCliprVideoGeneration = mutation({
  args: {
    estimatedSeconds: v.number(),
    secret: v.string(),
  },
  handler: async (ctx, { estimatedSeconds, secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const generatedSeconds = getPositiveCount(
      estimatedSeconds,
      "Estimated video seconds",
    );

    await rateLimiter.limit(ctx, "cliprVideoGenerate", {
      key: ownerId,
      count: generatedSeconds,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprProviderSpendGlobal", {
      count: generatedSeconds,
      throws: true,
    });
  },
});

export const consumeCliprAvatarStillGeneration = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "cliprAvatarStillGenerate", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprProviderSpendGlobal", {
      throws: true,
    });
  },
});

export const consumeCliprMusicGeneration = mutation({
  args: {
    generatedSeconds: v.number(),
    secret: v.string(),
  },
  handler: async (ctx, { generatedSeconds, secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const musicSeconds = getPositiveCount(
      generatedSeconds,
      "Generated music seconds",
    );

    await rateLimiter.limit(ctx, "cliprMusicGenerate", {
      key: ownerId,
      count: musicSeconds,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprMusicGenerateDaily", {
      key: ownerId,
      count: musicSeconds,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprProviderSpendGlobal", {
      count: musicSeconds,
      throws: true,
    });
  },
});

export const consumeStitchMusicGeneration = mutation({
  args: {
    generatedSeconds: v.number(),
    secret: v.string(),
  },
  handler: async (ctx, { generatedSeconds, secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const musicSeconds = getPositiveCount(
      generatedSeconds,
      "Generated music seconds",
    );

    await rateLimiter.limit(ctx, "stitchMusicGenerate", {
      key: ownerId,
      count: musicSeconds,
      throws: true,
    });
    await rateLimiter.limit(ctx, "stitchMusicGenerateDaily", {
      key: ownerId,
      count: musicSeconds,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprProviderSpendGlobal", {
      count: musicSeconds,
      throws: true,
    });
  },
});

export const consumeSharedMusicGeneration = mutation({
  args: {
    generatedSeconds: v.number(),
    secret: v.string(),
  },
  handler: async (ctx, { generatedSeconds, secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const musicSeconds = getPositiveCount(
      generatedSeconds,
      "Generated music seconds",
    );

    await rateLimiter.limit(ctx, "sharedMusicGenerate", {
      key: ownerId,
      count: musicSeconds,
      throws: true,
    });
    await rateLimiter.limit(ctx, "sharedMusicGenerateDaily", {
      key: ownerId,
      count: musicSeconds,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprProviderSpendGlobal", {
      count: musicSeconds,
      throws: true,
    });
  },
});

export const consumeCliprJobPoll = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "cliprJobPoll", {
      key: ownerId,
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

export const consumeSwiprBackgroundGenerate = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "replicateSwiprBackgroundGenerate", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateSwiprBackgroundGenerateDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateSwiprBackgroundGenerateMonthly", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateSwiprBackgroundGenerateGlobal", {
      throws: true,
    });
  },
});

export const consumeSwiprSeedBackgroundGenerateDev = mutation({
  args: {
    count: v.number(),
    secret: v.string(),
  },
  handler: async (ctx, { count, secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const imageCount = getPositiveCount(count, "Image count");

    await rateLimiter.limit(ctx, "replicateSwiprSeedBackgroundGenerateDev", {
      key: ownerId,
      count: imageCount,
      throws: true,
    });
    await rateLimiter.limit(
      ctx,
      "replicateSwiprSeedBackgroundGenerateDevGlobal",
      {
        count: imageCount,
        throws: true,
      },
    );
  },
});

export const consumeProductEnrichment = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "replicateProductEnrichment", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateProductEnrichmentMonthly", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "replicateProductEnrichmentGlobal", {
      throws: true,
    });
  },
});

export const consumeAvatarCascadeDelete = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "avatarCascadeDelete", {
      key: ownerId,
      throws: true,
    });
  },
});
