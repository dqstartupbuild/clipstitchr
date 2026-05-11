import { v } from "convex/values";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation } from "./_generated/server";
import { replicatePredictionStatusValidator } from "./validators/replicatePredictionStatus";

export const recordSwaprJob = mutation({
  args: {
    secret: v.string(),
    predictionId: v.string(),
    modelId: v.string(),
    status: replicatePredictionStatusValidator,
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    { secret, predictionId, modelId, status, createdAt, updatedAt },
  ) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existingJob = await ctx.db
      .query("replicateJobs")
      .withIndex("by_owner_prediction", (q) =>
        q.eq("ownerId", ownerId).eq("predictionId", predictionId),
      )
      .unique();
    const job = {
      ownerId,
      predictionId,
      purpose: "swapr-video" as const,
      modelId,
      status,
      createdAt,
      updatedAt,
    };

    if (existingJob) {
      await ctx.db.patch(existingJob._id, job);
      return existingJob._id;
    }

    return await ctx.db.insert("replicateJobs", job);
  },
});

export const recordAvatarPhotoJob = mutation({
  args: {
    secret: v.string(),
    predictionId: v.string(),
    modelId: v.string(),
    status: replicatePredictionStatusValidator,
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    { secret, predictionId, modelId, status, createdAt, updatedAt },
  ) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existingJob = await ctx.db
      .query("replicateJobs")
      .withIndex("by_owner_prediction", (q) =>
        q.eq("ownerId", ownerId).eq("predictionId", predictionId),
      )
      .unique();
    const job = {
      ownerId,
      predictionId,
      purpose: "avatar-photo" as const,
      modelId,
      status,
      createdAt,
      updatedAt,
    };

    if (existingJob) {
      await ctx.db.patch(existingJob._id, job);
      return existingJob._id;
    }

    return await ctx.db.insert("replicateJobs", job);
  },
});

export const recordCliprAudioJob = mutation({
  args: {
    secret: v.string(),
    predictionId: v.string(),
    modelId: v.string(),
    status: replicatePredictionStatusValidator,
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    { secret, predictionId, modelId, status, createdAt, updatedAt },
  ) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existingJob = await ctx.db
      .query("replicateJobs")
      .withIndex("by_owner_prediction", (q) =>
        q.eq("ownerId", ownerId).eq("predictionId", predictionId),
      )
      .unique();
    const job = {
      ownerId,
      predictionId,
      purpose: "clipr-audio" as const,
      modelId,
      status,
      createdAt,
      updatedAt,
    };

    if (existingJob) {
      await ctx.db.patch(existingJob._id, job);
      return existingJob._id;
    }

    return await ctx.db.insert("replicateJobs", job);
  },
});

export const recordCliprVideoJob = mutation({
  args: {
    secret: v.string(),
    predictionId: v.string(),
    modelId: v.string(),
    status: replicatePredictionStatusValidator,
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    { secret, predictionId, modelId, status, createdAt, updatedAt },
  ) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existingJob = await ctx.db
      .query("replicateJobs")
      .withIndex("by_owner_prediction", (q) =>
        q.eq("ownerId", ownerId).eq("predictionId", predictionId),
      )
      .unique();
    const job = {
      ownerId,
      predictionId,
      purpose: "clipr-video" as const,
      modelId,
      status,
      createdAt,
      updatedAt,
    };

    if (existingJob) {
      await ctx.db.patch(existingJob._id, job);
      return existingJob._id;
    }

    return await ctx.db.insert("replicateJobs", job);
  },
});

export const updateSwaprJobStatus = mutation({
  args: {
    secret: v.string(),
    predictionId: v.string(),
    status: replicatePredictionStatusValidator,
    outputUrl: v.optional(v.string()),
    error: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    { secret, predictionId, status, outputUrl, error, updatedAt },
  ) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const job = await ctx.db
      .query("replicateJobs")
      .withIndex("by_owner_prediction", (q) =>
        q.eq("ownerId", ownerId).eq("predictionId", predictionId),
      )
      .unique();

    if (!job || job.purpose !== "swapr-video") {
      throw new Error("Swapr job not found.");
    }

    await ctx.db.patch(job._id, {
      status,
      ...(outputUrl === undefined ? {} : { outputUrl }),
      ...(error === undefined ? {} : { error }),
      updatedAt,
    });
  },
});

export const updateAvatarPhotoJobStatus = mutation({
  args: {
    secret: v.string(),
    predictionId: v.string(),
    status: replicatePredictionStatusValidator,
    outputUrl: v.optional(v.string()),
    error: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    { secret, predictionId, status, outputUrl, error, updatedAt },
  ) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const job = await ctx.db
      .query("replicateJobs")
      .withIndex("by_owner_prediction", (q) =>
        q.eq("ownerId", ownerId).eq("predictionId", predictionId),
      )
      .unique();

    if (!job || job.purpose !== "avatar-photo") {
      throw new Error("Avatar photo job not found.");
    }

    await ctx.db.patch(job._id, {
      status,
      ...(outputUrl === undefined ? {} : { outputUrl }),
      ...(error === undefined ? {} : { error }),
      updatedAt,
    });
  },
});

export const updateCliprAudioJobStatus = mutation({
  args: {
    secret: v.string(),
    predictionId: v.string(),
    status: replicatePredictionStatusValidator,
    outputUrl: v.optional(v.string()),
    error: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    { secret, predictionId, status, outputUrl, error, updatedAt },
  ) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const job = await ctx.db
      .query("replicateJobs")
      .withIndex("by_owner_prediction", (q) =>
        q.eq("ownerId", ownerId).eq("predictionId", predictionId),
      )
      .unique();

    if (!job || job.purpose !== "clipr-audio") {
      throw new Error("Clipr audio job not found.");
    }

    await ctx.db.patch(job._id, {
      status,
      ...(outputUrl === undefined ? {} : { outputUrl }),
      ...(error === undefined ? {} : { error }),
      updatedAt,
    });
  },
});

export const updateCliprVideoJobStatus = mutation({
  args: {
    secret: v.string(),
    predictionId: v.string(),
    status: replicatePredictionStatusValidator,
    outputUrl: v.optional(v.string()),
    error: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    { secret, predictionId, status, outputUrl, error, updatedAt },
  ) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const job = await ctx.db
      .query("replicateJobs")
      .withIndex("by_owner_prediction", (q) =>
        q.eq("ownerId", ownerId).eq("predictionId", predictionId),
      )
      .unique();

    if (!job || job.purpose !== "clipr-video") {
      throw new Error("Clipr video job not found.");
    }

    await ctx.db.patch(job._id, {
      status,
      ...(outputUrl === undefined ? {} : { outputUrl }),
      ...(error === undefined ? {} : { error }),
      updatedAt,
    });
  },
});
