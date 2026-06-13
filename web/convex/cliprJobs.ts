import { v } from "convex/values";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { assertMediaWorkerSecret } from "./auth/assertMediaWorkerSecret";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { videoClipCounts } from "./aggregateCounts";
import { rateLimiter } from "./rateLimiter";
import { automationProvenanceValidator } from "./validators/automationProvenance";
import { cliprDurationSecondsValidator } from "./validators/cliprDurationSeconds";
import { cliprGenerationModeValidator } from "./validators/cliprGenerationMode";
import { cliprMusicMetadataValidator } from "./validators/cliprMusicMetadata";
import { cliprResolvedGenerationModeValidator } from "./validators/cliprResolvedGenerationMode";
import { cliprScenePlanValidator } from "./validators/cliprScenePlan";
import { cliprVideoModelIdValidator } from "./validators/cliprVideoModelId";
import { r2ObjectValidator } from "./validators/r2Object";

const clientJobFields = (job: {
  avatarId: string;
  avatarImageObject?: { contentType: string; key: string; size: number };
  avatarImageProviderPredictionId?: string;
  avatarPhotoId: string;
  avatarVideoObject?: { contentType: string; key: string; size: number };
  avatarVideoProviderPredictionId?: string;
  completedAt?: string;
  createdAt: string;
  error?: string;
  filledHook?: string;
  finalClipId?: string;
  id: string;
  music?: {
    audioObject: { contentType: string; key: string; size: number };
    createdAt: string;
    durationSeconds: number;
    enabled: boolean;
    prompt: string;
    providerModel: string;
    providerPredictionId: string;
    sharedTrackId?: string;
    tags?: string[];
    title?: string;
    updatedAt: string;
    volume: number;
  };
  productId: string;
  productName: string;
  demoClipId?: string;
  demoClipName?: string;
  progress: number;
  requestedGenerationMode?: "any" | "script" | "reaction" | "broll" | "demo";
  generationMode?: "script" | "reaction" | "broll" | "demo";
  requestedVideoModelId?:
    | "auto"
    | "prunaai/p-video-avatar"
    | "kwaivgi/kling-v3-video"
    | "bytedance/seedance-2.0"
    | "google/veo-3.1"
    | "openai/sora-2"
    | "openai/sora-2-pro";
  videoModelId?:
    | "auto"
    | "prunaai/p-video-avatar"
    | "kwaivgi/kling-v3-video"
    | "bytedance/seedance-2.0"
    | "google/veo-3.1"
    | "openai/sora-2"
    | "openai/sora-2-pro";
  scriptIdea?: string;
  scenePlan: {
    estimatedDurationSeconds: number;
    generatedImageObject?: { contentType: string; key: string; size: number };
    generatedVideoObject?: { contentType: string; key: string; size: number };
    id: string;
    index: number;
    photoScript?: string;
    providerImagePredictionId?: string;
    providerPredictionId?: string;
    sceneType: "avatar" | "demo";
    scriptText: string;
    visualPrompt: string;
    voiceAudioObject?: { contentType: string; key: string; size: number };
  }[];
  script?: string;
  stage: string;
  status: string;
  targetDurationSeconds: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 30 | 60;
  updatedAt: string;
  voiceId: string;
}) => ({
  id: job.id,
  productId: job.productId,
  productName: job.productName,
  avatarId: job.avatarId,
  avatarPhotoId: job.avatarPhotoId,
  demoClipId: job.demoClipId,
  demoClipName: job.demoClipName,
  avatarImageObject: job.avatarImageObject,
  avatarVideoObject: job.avatarVideoObject,
  avatarImageProviderPredictionId: job.avatarImageProviderPredictionId,
  avatarVideoProviderPredictionId: job.avatarVideoProviderPredictionId,
  music: job.music,
  voiceId: job.voiceId,
  requestedGenerationMode: job.requestedGenerationMode ?? "script",
  generationMode: job.generationMode ?? "script",
  requestedVideoModelId: job.requestedVideoModelId ?? "prunaai/p-video-avatar",
  videoModelId: job.videoModelId ?? "prunaai/p-video-avatar",
  scriptIdea: job.scriptIdea,
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

export const getForMediaWorker = query({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
  },
  handler: async (ctx, { secret, ownerId, id }) => {
    assertMediaWorkerSecret(secret);

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
    demoClipId: v.optional(v.string()),
    demoClipName: v.optional(v.string()),
    voiceId: v.string(),
    requestedGenerationMode: v.optional(cliprGenerationModeValidator),
    generationMode: v.optional(cliprResolvedGenerationModeValidator),
    requestedVideoModelId: v.optional(cliprVideoModelIdValidator),
    videoModelId: v.optional(cliprVideoModelIdValidator),
    scriptIdea: v.optional(v.string()),
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

    const jobId = await ctx.db.insert("cliprJobs", {
      ownerId,
      ...job,
      requestedGenerationMode: job.requestedGenerationMode ?? "script",
      generationMode: job.generationMode ?? "script",
      requestedVideoModelId: job.requestedVideoModelId ?? "prunaai/p-video-avatar",
      videoModelId: job.videoModelId ?? "prunaai/p-video-avatar",
      scenePlan: [],
      providerModels: [],
      status: "scripting",
      stage: "hook-script",
      progress: 0.08,
      updatedAt: job.createdAt,
    });
    const createdJob = await ctx.db.get(jobId);

    if (!createdJob) {
      throw new Error("Unable to create Clipr job.");
    }

    return clientJobFields(createdJob);
  },
});

export const createQueuedFromAutomation = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
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
    demoClipId: v.optional(v.string()),
    demoClipName: v.optional(v.string()),
    voiceId: v.string(),
    requestedGenerationMode: v.optional(cliprGenerationModeValidator),
    generationMode: v.optional(cliprResolvedGenerationModeValidator),
    requestedVideoModelId: v.optional(cliprVideoModelIdValidator),
    videoModelId: v.optional(cliprVideoModelIdValidator),
    scriptIdea: v.optional(v.string()),
    targetDurationSeconds: cliprDurationSecondsValidator,
    createdAt: v.string(),
  },
  handler: async (ctx, { secret, ownerId, ...job }) => {
    assertAutomationWorkerSecret(secret);

    const existingJob = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", job.id),
      )
      .unique();

    if (existingJob) {
      return clientJobFields(existingJob);
    }

    const jobId = await ctx.db.insert("cliprJobs", {
      ownerId,
      ...job,
      requestedGenerationMode: job.requestedGenerationMode ?? "script",
      generationMode: job.generationMode ?? "script",
      requestedVideoModelId: job.requestedVideoModelId ?? "prunaai/p-video-avatar",
      videoModelId: job.videoModelId ?? "prunaai/p-video-avatar",
      scenePlan: [],
      providerModels: [],
      status: "scripting",
      stage: "hook-script",
      progress: 0.08,
      updatedAt: job.createdAt,
    });
    const insertedJob = await ctx.db.get(jobId);

    if (!insertedJob) {
      throw new Error("Unable to create Clipr automation job.");
    }

    return clientJobFields(insertedJob);
  },
});

export const createQueuedFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
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
    demoClipId: v.optional(v.string()),
    demoClipName: v.optional(v.string()),
    voiceId: v.string(),
    requestedGenerationMode: v.optional(cliprGenerationModeValidator),
    generationMode: v.optional(cliprResolvedGenerationModeValidator),
    requestedVideoModelId: v.optional(cliprVideoModelIdValidator),
    videoModelId: v.optional(cliprVideoModelIdValidator),
    scriptIdea: v.optional(v.string()),
    targetDurationSeconds: cliprDurationSecondsValidator,
    createdAt: v.string(),
  },
  handler: async (ctx, { secret, ownerId, ...job }) => {
    assertProviderWorkerSecret(secret);

    const existingJob = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", job.id),
      )
      .unique();

    if (existingJob) {
      return clientJobFields(existingJob);
    }

    const jobId = await ctx.db.insert("cliprJobs", {
      ownerId,
      ...job,
      requestedGenerationMode: job.requestedGenerationMode ?? "script",
      generationMode: job.generationMode ?? "script",
      requestedVideoModelId: job.requestedVideoModelId ?? "prunaai/p-video-avatar",
      videoModelId: job.videoModelId ?? "prunaai/p-video-avatar",
      scenePlan: [],
      providerModels: [],
      status: "scripting",
      stage: "hook-script",
      progress: 0.08,
      updatedAt: job.createdAt,
    });
    const insertedJob = await ctx.db.get(jobId);

    if (!insertedJob) {
      throw new Error("Unable to create Clipr automation job.");
    }

    return clientJobFields(insertedJob);
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
      status: "generating-avatar-image",
      stage: "avatar-image",
      progress: 0.25,
      updatedAt,
    });
  },
});

export const applyScriptPlanFromAutomation = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
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
      ownerId,
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
    assertAutomationWorkerSecret(secret);

    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      throw new Error("Clipr job not found.");
    }

    const patch = {
      hookStyleKey,
      hookTemplateId,
      filledHook,
      variablesUsed,
      script,
      scenePlan,
      providerModels: Array.from(new Set([...job.providerModels, providerModel])),
      status: "generating-avatar-image" as const,
      stage: "avatar-image" as const,
      progress: 0.25,
      updatedAt,
    };

    await ctx.db.patch(job._id, patch);

    return clientJobFields({
      ...job,
      ...patch,
    });
  },
});

export const applyScriptPlanFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
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
      ownerId,
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
    assertProviderWorkerSecret(secret);

    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      throw new Error("Clipr job not found.");
    }

    const patch = {
      hookStyleKey,
      hookTemplateId,
      filledHook,
      variablesUsed,
      script,
      scenePlan,
      providerModels: Array.from(new Set([...job.providerModels, providerModel])),
      status: "generating-avatar-image" as const,
      stage: "avatar-image" as const,
      progress: 0.25,
      updatedAt,
    };

    await ctx.db.patch(job._id, patch);

    return clientJobFields({
      ...job,
      ...patch,
    });
  },
});

export const recordAvatarImageOutput = mutation({
  args: {
    secret: v.string(),
    id: v.string(),
    avatarImageObject: r2ObjectValidator,
    avatarImageProviderPredictionId: v.string(),
    providerModels: v.array(v.string()),
    progress: v.number(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      id,
      avatarImageObject,
      avatarImageProviderPredictionId,
      providerModels,
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
      avatarImageObject,
      avatarImageProviderPredictionId,
      providerModels: Array.from(
        new Set([...job.providerModels, ...providerModels]),
      ),
      status: "generating-avatar-video",
      stage: "avatar-video",
      progress,
      updatedAt,
    });
  },
});

export const recordAvatarImageOutputFromAutomation = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    avatarImageObject: r2ObjectValidator,
    avatarImageProviderPredictionId: v.string(),
    providerModels: v.array(v.string()),
    progress: v.number(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      id,
      avatarImageObject,
      avatarImageProviderPredictionId,
      providerModels,
      progress,
      updatedAt,
    },
  ) => {
    assertAutomationWorkerSecret(secret);

    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      throw new Error("Clipr job not found.");
    }

    const patch = {
      avatarImageObject,
      avatarImageProviderPredictionId,
      providerModels: Array.from(
        new Set([...job.providerModels, ...providerModels]),
      ),
      status: "generating-avatar-video" as const,
      stage: "avatar-video" as const,
      progress,
      updatedAt,
    };

    await ctx.db.patch(job._id, patch);

    return clientJobFields({
      ...job,
      ...patch,
    });
  },
});

export const recordAvatarImageOutputFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    avatarImageObject: r2ObjectValidator,
    avatarImageProviderPredictionId: v.string(),
    providerModels: v.array(v.string()),
    progress: v.number(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      id,
      avatarImageObject,
      avatarImageProviderPredictionId,
      providerModels,
      progress,
      updatedAt,
    },
  ) => {
    assertProviderWorkerSecret(secret);

    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      throw new Error("Clipr job not found.");
    }

    const patch = {
      avatarImageObject,
      avatarImageProviderPredictionId,
      providerModels: Array.from(
        new Set([...job.providerModels, ...providerModels]),
      ),
      status: "generating-avatar-video" as const,
      stage: "avatar-video" as const,
      progress,
      updatedAt,
    };

    await ctx.db.patch(job._id, patch);

    return clientJobFields({
      ...job,
      ...patch,
    });
  },
});

export const recordAvatarVideoOutput = mutation({
  args: {
    secret: v.string(),
    id: v.string(),
    avatarVideoObject: r2ObjectValidator,
    avatarVideoProviderPredictionId: v.string(),
    music: v.optional(cliprMusicMetadataValidator),
    providerModels: v.array(v.string()),
    progress: v.number(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      id,
      avatarVideoObject,
      avatarVideoProviderPredictionId,
      music,
      providerModels,
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

    const patch = {
      avatarVideoObject,
      avatarVideoProviderPredictionId,
      ...(music ? { music } : {}),
      providerModels: Array.from(
        new Set([...job.providerModels, ...providerModels]),
      ),
      status: "ready-to-save" as const,
      stage: "browser-save" as const,
      progress,
      updatedAt,
    };

    await ctx.db.patch(job._id, patch);

    return clientJobFields({
      ...job,
      ...patch,
    });
  },
});

export const recordAvatarVideoOutputFromAutomation = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    avatarVideoObject: r2ObjectValidator,
    avatarVideoProviderPredictionId: v.string(),
    music: v.optional(cliprMusicMetadataValidator),
    providerModels: v.array(v.string()),
    progress: v.number(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      id,
      avatarVideoObject,
      avatarVideoProviderPredictionId,
      music,
      providerModels,
      progress,
      updatedAt,
    },
  ) => {
    assertAutomationWorkerSecret(secret);

    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      throw new Error("Clipr job not found.");
    }

    const patch = {
      avatarVideoObject,
      avatarVideoProviderPredictionId,
      ...(music ? { music } : {}),
      providerModels: Array.from(
        new Set([...job.providerModels, ...providerModels]),
      ),
      status: "ready-to-save" as const,
      stage: "browser-save" as const,
      progress,
      updatedAt,
    };

    await ctx.db.patch(job._id, patch);

    return clientJobFields({
      ...job,
      ...patch,
    });
  },
});

export const recordAvatarVideoOutputFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    avatarVideoObject: r2ObjectValidator,
    avatarVideoProviderPredictionId: v.string(),
    music: v.optional(cliprMusicMetadataValidator),
    providerModels: v.array(v.string()),
    progress: v.number(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      ownerId,
      id,
      avatarVideoObject,
      avatarVideoProviderPredictionId,
      music,
      providerModels,
      progress,
      updatedAt,
    },
  ) => {
    assertProviderWorkerSecret(secret);

    const job = await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!job) {
      throw new Error("Clipr job not found.");
    }

    const patch = {
      avatarVideoObject,
      avatarVideoProviderPredictionId,
      ...(music ? { music } : {}),
      providerModels: Array.from(
        new Set([...job.providerModels, ...providerModels]),
      ),
      status: "ready-to-save" as const,
      stage: "browser-save" as const,
      progress,
      updatedAt,
    };

    await ctx.db.patch(job._id, patch);

    return clientJobFields({
      ...job,
      ...patch,
    });
  },
});

export const markBrowserSaving = mutation({
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
      status: "saving",
      stage: "browser-save",
      progress: Math.max(job.progress, 0.72),
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
      libraryKind: "clipr",
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
        ...(job.demoClipId ? { demoClipId: job.demoClipId } : {}),
        ...(job.demoClipName ? { demoClipName: job.demoClipName } : {}),
        voiceId: job.voiceId,
        requestedGenerationMode: job.requestedGenerationMode ?? "script",
        generationMode: job.generationMode ?? "script",
        requestedVideoModelId:
          job.requestedVideoModelId ?? "prunaai/p-video-avatar",
        videoModelId: job.videoModelId ?? "prunaai/p-video-avatar",
        ...(job.scriptIdea ? { scriptIdea: job.scriptIdea } : {}),
        targetDurationSeconds: job.targetDurationSeconds,
        hookStyleKey: job.hookStyleKey,
        hookTemplateId: job.hookTemplateId,
        filledHook: job.filledHook,
        variablesUsed: job.variablesUsed,
        script: job.script,
        sceneCount: job.scenePlan.length,
        finalDurationSeconds: args.duration,
        music: job.music,
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

export const finalizeWithClipFromMediaWorker = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
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
    automation: v.optional(automationProvenanceValidator),
    updatedAt: v.string(),
  },
  handler: async (ctx, { secret, ownerId, automation, ...args }) => {
    assertMediaWorkerSecret(secret);

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

    await rateLimiter.limit(ctx, "automationAssetSaveDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "automationAssetSaveGlobalDaily", {
      throws: true,
    });

    const existingClip = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.clipId),
      )
      .unique();
    const clip = {
      ownerId,
      id: args.clipId,
      name: args.name,
      tags: ["ugc", "clipr"],
      originalName: `${args.name}.mp4`,
      clipType: "ugc" as const,
      libraryKind: "clipr" as const,
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
        ...(job.demoClipId ? { demoClipId: job.demoClipId } : {}),
        ...(job.demoClipName ? { demoClipName: job.demoClipName } : {}),
        voiceId: job.voiceId,
        requestedGenerationMode: job.requestedGenerationMode ?? "script",
        generationMode: job.generationMode ?? "script",
        requestedVideoModelId:
          job.requestedVideoModelId ?? "prunaai/p-video-avatar",
        videoModelId: job.videoModelId ?? "prunaai/p-video-avatar",
        ...(job.scriptIdea ? { scriptIdea: job.scriptIdea } : {}),
        targetDurationSeconds: job.targetDurationSeconds,
        hookStyleKey: job.hookStyleKey,
        hookTemplateId: job.hookTemplateId,
        filledHook: job.filledHook,
        variablesUsed: job.variablesUsed,
        script: job.script,
        sceneCount: job.scenePlan.length,
        finalDurationSeconds: args.duration,
        music: job.music,
        providerModels: job.providerModels,
        createdAt: job.createdAt,
      },
      ...(automation ? { automation } : {}),
      createdAt: args.updatedAt,
      updatedAt: args.updatedAt,
    };

    if (existingClip) {
      await ctx.db.patch(existingClip._id, clip);
      const updatedClip = await ctx.db.get(existingClip._id);

      if (updatedClip) {
        await videoClipCounts.replaceOrInsert(ctx, existingClip, updatedClip);
      }
    } else {
      const insertedClipId = await ctx.db.insert("videoClips", clip);
      const insertedClip = await ctx.db.get(insertedClipId);

      if (insertedClip) {
        await videoClipCounts.insertIfDoesNotExist(ctx, insertedClip);
      }
    }

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

export const failFromAutomation = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    error: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { secret, ownerId, id, error, updatedAt }) => {
    assertAutomationWorkerSecret(secret);

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

export const failFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    error: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { secret, ownerId, id, error, updatedAt }) => {
    assertProviderWorkerSecret(secret);

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

export const failFromMediaWorker = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    error: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { secret, ownerId, id, error, updatedAt }) => {
    assertMediaWorkerSecret(secret);

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
