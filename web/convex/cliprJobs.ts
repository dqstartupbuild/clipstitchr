import { v } from "convex/values";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { cliprDurationSecondsValidator } from "./validators/cliprDurationSeconds";
import { cliprScenePlanValidator } from "./validators/cliprScenePlan";
import { r2ObjectValidator } from "./validators/r2Object";

const clientJobFields = (job: {
  avatarId: string;
  avatarPhotoId: string;
  completedAt?: string;
  createdAt: string;
  error?: string;
  filledHook?: string;
  finalClipId?: string;
  id: string;
  productId: string;
  productName: string;
  progress: number;
  scenePlan: {
    estimatedDurationSeconds: number;
    generatedImageObject?: { contentType: string; key: string; size: number };
    generatedVideoObject?: { contentType: string; key: string; size: number };
    id: string;
    index: number;
    photoScript?: string;
    providerImagePredictionId?: string;
    providerPredictionId?: string;
    sceneType: "avatar" | "b_roll";
    scriptText: string;
    visualPrompt: string;
    voiceAudioObject?: { contentType: string; key: string; size: number };
  }[];
  script?: string;
  stage: string;
  status: string;
  targetDurationSeconds: 30 | 60;
  updatedAt: string;
  voiceId: string;
}) => ({
  id: job.id,
  productId: job.productId,
  productName: job.productName,
  avatarId: job.avatarId,
  avatarPhotoId: job.avatarPhotoId,
  voiceId: job.voiceId,
  targetDurationSeconds: job.targetDurationSeconds,
  filledHook: job.filledHook,
  script: job.script,
  scenePlan: job.scenePlan,
  status: job.status,
  stage: job.stage,
  progress: job.progress,
  error: job.error,
  finalClipId: job.finalClipId,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
  completedAt: job.completedAt,
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const jobs = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(20);

    return jobs.map(clientJobFields);
  },
});

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    return job ? clientJobFields(job) : null;
  },
});

export const createQueued = mutation({
  args: {
    secret: v.string(),
    id: v.string(),
    productId: v.string(),
    productName: v.string(),
    productDetails: v.string(),
    audienceDetails: v.string(),
    productInferredProblem: v.optional(v.string()),
    productInferredPainPoints: v.array(v.string()),
    avatarId: v.string(),
    avatarName: v.string(),
    avatarPhotoId: v.string(),
    voiceId: v.string(),
    targetDurationSeconds: cliprDurationSecondsValidator,
    createdAt: v.string(),
  },
  handler: async (ctx, { secret, ...job }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexCliprJobWrite", {
      key: ownerId,
      throws: true,
    });

    return await ctx.db.insert("cliprJobs", {
      ownerId,
      ...job,
      scenePlan: [],
      providerModels: [],
      status: "queued",
      stage: "queued",
      progress: 0,
      updatedAt: job.createdAt,
    });
  },
});

export const applyScriptPlan = mutation({
  args: {
    secret: v.string(),
    id: v.string(),
    hookStyleKey: v.string(),
    hookTemplateId: v.string(),
    filledHook: v.string(),
    variablesUsed: v.record(v.string(), v.string()),
    script: v.string(),
    scenePlan: v.array(cliprScenePlanValidator),
    providerModel: v.string(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      id,
      hookStyleKey,
      hookTemplateId,
      filledHook,
      variablesUsed,
      script,
      scenePlan,
      providerModel,
      updatedAt,
    },
  ) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      throw new Error("Clipr job not found.");
    }

    await rateLimiter.limit(ctx, "convexCliprJobWrite", {
      key: ownerId,
      throws: true,
    });

    await ctx.db.patch(job._id, {
      hookStyleKey,
      hookTemplateId,
      filledHook,
      variablesUsed,
      script,
      scenePlan,
      providerModels: Array.from(new Set([...job.providerModels, providerModel])),
      status: "generating-scenes",
      stage: "scene-generation",
      progress: 0.25,
      updatedAt,
    });
  },
});

export const recordSceneOutput = mutation({
  args: {
    secret: v.string(),
    id: v.string(),
    sceneId: v.string(),
    generatedImageObject: v.optional(r2ObjectValidator),
    generatedVideoObject: r2ObjectValidator,
    providerImagePredictionId: v.optional(v.string()),
    providerPredictionId: v.string(),
    providerModel: v.string(),
    progress: v.number(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      id,
      sceneId,
      generatedImageObject,
      generatedVideoObject,
      providerImagePredictionId,
      providerPredictionId,
      providerModel,
      progress,
      updatedAt,
    },
  ) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      throw new Error("Clipr job not found.");
    }

    await rateLimiter.limit(ctx, "convexCliprJobWrite", {
      key: ownerId,
      throws: true,
    });

    await ctx.db.patch(job._id, {
      scenePlan: job.scenePlan.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              ...(generatedImageObject === undefined
                ? {}
                : { generatedImageObject }),
              generatedVideoObject,
              ...(providerImagePredictionId === undefined
                ? {}
                : { providerImagePredictionId }),
              providerPredictionId,
            }
          : scene,
      ),
      providerModels: Array.from(new Set([...job.providerModels, providerModel])),
      status: "generating-scenes",
      stage: "scene-generation",
      progress,
      updatedAt,
    });
  },
});

export const markReadyToStitch = mutation({
  args: {
    secret: v.string(),
    id: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { secret, id, updatedAt }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      throw new Error("Clipr job not found.");
    }

    await ctx.db.patch(job._id, {
      status: "ready-to-stitch",
      stage: "browser-stitching",
      progress: 0.88,
      updatedAt,
    });

    return clientJobFields({
      ...job,
      status: "ready-to-stitch",
      stage: "browser-stitching",
      progress: 0.88,
      updatedAt,
    });
  },
});

export const markBrowserStitching = mutation({
  args: {
    id: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      throw new Error("Clipr job not found.");
    }

    await ctx.db.patch(job._id, {
      status: "stitching",
      stage: "browser-stitching",
      progress: Math.max(job.progress, 0.9),
      updatedAt,
    });
  },
});

export const finalizeWithClip = mutation({
  args: {
    id: v.string(),
    clipId: v.string(),
    name: v.string(),
    videoObject: r2ObjectValidator,
    posterObject: v.optional(r2ObjectValidator),
    posterVersion: v.optional(v.number()),
    mimeType: v.string(),
    sourceMimeType: v.string(),
    size: v.number(),
    originalSize: v.number(),
    width: v.number(),
    height: v.number(),
    aspectRatio: v.number(),
    duration: v.number(),
    hasAudio: v.boolean(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    if (!job) {
      throw new Error("Clipr job not found.");
    }

    if (job.finalClipId) {
      return job.finalClipId;
    }

    if (
      !job.hookStyleKey ||
      !job.hookTemplateId ||
      !job.filledHook ||
      !job.variablesUsed ||
      !job.script
    ) {
      throw new Error("Clipr job is missing script metadata.");
    }

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "convexCliprJobWrite", {
      key: ownerId,
      throws: true,
    });

    await ctx.db.insert("videoClips", {
      ownerId,
      id: args.clipId,
      name: args.name,
      tags: ["ugc", "clipr"],
      originalName: `${args.name}.mp4`,
      clipType: "ugc",
      videoObject: args.videoObject,
      posterObject: args.posterObject,
      posterVersion: args.posterVersion,
      mimeType: args.mimeType,
      sourceMimeType: args.sourceMimeType,
      size: args.size,
      originalSize: args.originalSize,
      width: args.width,
      height: args.height,
      aspectRatio: args.aspectRatio,
      duration: args.duration,
      hasAudio: args.hasAudio,
      cliprMetadata: {
        jobId: job.id,
        productId: job.productId,
        productName: job.productName,
        avatarId: job.avatarId,
        avatarPhotoId: job.avatarPhotoId,
        voiceId: job.voiceId,
        targetDurationSeconds: job.targetDurationSeconds,
        hookStyleKey: job.hookStyleKey,
        hookTemplateId: job.hookTemplateId,
        filledHook: job.filledHook,
        variablesUsed: job.variablesUsed,
        script: job.script,
        sceneCount: job.scenePlan.length,
        finalDurationSeconds: args.duration,
        providerModels: job.providerModels,
        createdAt: job.createdAt,
      },
      createdAt: args.updatedAt,
      updatedAt: args.updatedAt,
    });

    await ctx.db.patch(job._id, {
      finalClipId: args.clipId,
      status: "completed",
      stage: "finalized",
      progress: 1,
      completedAt: args.updatedAt,
      finalizedAt: args.updatedAt,
      updatedAt: args.updatedAt,
    });

    return args.clipId;
  },
});

export const fail = mutation({
  args: {
    secret: v.string(),
    id: v.string(),
    error: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { secret, id, error, updatedAt }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      return null;
    }

    await ctx.db.patch(job._id, {
      status: "failed",
      stage: "failed",
      error,
      updatedAt,
    });

    return null;
  },
});

export const cancel = mutation({
  args: {
    id: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "cliprJobCancel", {
      key: ownerId,
      throws: true,
    });

    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      return null;
    }

    await ctx.db.patch(job._id, {
      status: "canceled",
      stage: "canceled",
      updatedAt,
    });

    return clientJobFields({
      ...job,
      status: "canceled",
      stage: "canceled",
      updatedAt,
    });
  },
});
