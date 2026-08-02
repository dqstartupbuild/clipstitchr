import { v } from "convex/values";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { consumeR2UploadLimits } from "./rateLimits/consumeR2UploadLimits";
import { consumePublishingMediaReadLimits } from "./rateLimits/consumePublishingMediaReadLimits";

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

    await consumeR2UploadLimits(ctx, {
      objectCount: 1,
      ownerId,
      totalBytes: uploadBytes,
    });
  },
});

export const consumeSwipePublishingPrepare = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "swipePublishingPrepare", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "swipePublishingPrepareGlobal", {
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

export const consumePublishingMediaRead = mutation({
  args: {
    grantKey: v.string(),
    quotaIdentity: v.string(),
    readBytes: v.number(),
    secret: v.string(),
  },
  handler: async (
    ctx,
    { grantKey, quotaIdentity, readBytes, secret },
  ) => {
    assertRateLimitApiSecret(secret);

    await consumePublishingMediaReadLimits(ctx, {
      grantKey,
      quotaIdentity,
      readBytes,
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

export const consumeTikTokSoundLookup = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "tiktokSoundLookup", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "tiktokSoundLookupGlobal", {
      throws: true,
    });
  },
});

export const consumeTikTokSoundImport = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "tiktokSoundImport", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "tiktokSoundImportGlobal", {
      throws: true,
    });
  },
});

export const consumeHookLabPostAnalysis = mutation({
  args: {
    idempotencyKey: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { idempotencyKey, secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existingJob = await ctx.db
      .query("providerJobs")
      .withIndex("by_idempotency_key", (query) =>
        query.eq("idempotencyKey", idempotencyKey.trim()),
      )
      .unique();

    if (existingJob?.ownerId === ownerId) {
      return { alreadyReserved: true };
    }

    await rateLimiter.limit(ctx, "hookLabPostAnalysis", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "hookLabPostAnalysisGlobal", {
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprProviderSpendGlobal", {
      throws: true,
    });

    return { alreadyReserved: false };
  },
});

export const consumeHookLabCreativeBrief = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "hookLabCreativeBrief", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "hookLabCreativeBriefGlobal", {
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprProviderSpendGlobal", {
      throws: true,
    });
  },
});

export const consumePostBridgeRead = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "postBridgeRead", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "postBridgeReadGlobal", {
      throws: true,
    });
  },
});

export const consumePostBridgeSchedule = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "postBridgeSchedule", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "postBridgeScheduleHourly", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "postBridgeScheduleDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "postBridgeScheduleGlobalDaily", {
      throws: true,
    });
  },
});

export const consumePostBridgeMediaUpload = mutation({
  args: {
    mediaSizeBytes: v.number(),
    secret: v.string(),
  },
  handler: async (ctx, { mediaSizeBytes, secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
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

export const consumePostBridgeAnalyticsSync = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "postBridgeAnalyticsSync", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "postBridgeAnalyticsSyncGlobal", {
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

export const consumeBlogPublishWebhook = mutation({
  args: {
    key: v.string(),
    secret: v.string(),
    articleCount: v.number(),
  },
  handler: async (ctx, { key, secret, articleCount }) => {
    assertRateLimitApiSecret(secret);

    const publishedArticleCount = getPositiveCount(
      articleCount,
      "Article count",
    );

    await rateLimiter.limit(ctx, "blogPublishWebhookByClient", {
      key,
      count: publishedArticleCount,
      throws: true,
    });
    await rateLimiter.limit(ctx, "blogPublishWebhookGlobal", {
      count: publishedArticleCount,
      throws: true,
    });
  },
});

export const consumePexelsSearch = mutation({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "pexelsSearch", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "pexelsSearchGlobal", {
      throws: true,
    });
  },
});

export const consumePexelsImport = mutation({
  args: {
    count: v.number(),
    secret: v.string(),
  },
  handler: async (ctx, { count, secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const imageCount = getPositiveCount(count, "Image count");

    await rateLimiter.limit(ctx, "pexelsImportImages", {
      count: imageCount,
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "pexelsImportImagesGlobal", {
      count: imageCount,
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
    count: v.optional(v.number()),
    secret: v.string(),
  },
  handler: async (ctx, { count, secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const generationCount =
      count === undefined ? undefined : getPositiveCount(count, "Generation count");

    await rateLimiter.limit(ctx, "cliprHookScriptGenerate", {
      ...(generationCount ? { count: generationCount } : {}),
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprProviderSpendGlobal", {
      ...(generationCount ? { count: generationCount } : {}),
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
