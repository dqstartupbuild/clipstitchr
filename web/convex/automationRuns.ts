import { v } from "convex/values";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { assertMediaWorkerSecret } from "./auth/assertMediaWorkerSecret";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { automationRunStatusValidator } from "./validators/automationRunStatus";
import { automationToolValidator } from "./validators/automationTool";

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 20 }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const cappedLimit = Math.max(1, Math.min(50, Math.floor(limit)));

    return await ctx.db
      .query("automationRuns")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(cappedLimit);
  },
});

export const create = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    automationDate: v.string(),
    tool: automationToolValidator,
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    dailyLimit: v.number(),
    createdAt: v.string(),
  },
  handler: async (ctx, { secret, ...run }) => {
    assertAutomationWorkerSecret(secret);

    const existing = await ctx.db
      .query("automationRuns")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", run.idempotencyKey),
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("automationRuns", {
      ...run,
      status: "queued",
      attempt: 0,
      updatedAt: run.createdAt,
    });
  },
});

export const markStatus = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    status: automationRunStatusValidator,
    error: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (ctx, { secret, ownerId, id, status, error, updatedAt }) => {
    assertAutomationWorkerSecret(secret);

    const run = await ctx.db
      .query("automationRuns")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!run) {
      throw new Error("Automation run not found.");
    }

    await ctx.db.patch(run._id, {
      status,
      ...(status === "running" && !run.startedAt ? { startedAt: updatedAt } : {}),
      ...(status === "completed" ? { completedAt: updatedAt } : {}),
      ...(status === "skipped" ? { skippedAt: updatedAt } : {}),
      ...(status === "failed" ? { failedAt: updatedAt } : {}),
      ...(error === undefined ? {} : { error }),
      updatedAt,
    });
  },
});

export const markProviderStatus = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    status: automationRunStatusValidator,
    error: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (ctx, { secret, ownerId, id, status, error, updatedAt }) => {
    assertProviderWorkerSecret(secret);

    const run = await ctx.db
      .query("automationRuns")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!run) {
      throw new Error("Automation run not found.");
    }

    await ctx.db.patch(run._id, {
      status,
      ...(status === "running" && !run.startedAt ? { startedAt: updatedAt } : {}),
      ...(status === "completed" ? { completedAt: updatedAt } : {}),
      ...(status === "skipped" ? { skippedAt: updatedAt } : {}),
      ...(status === "failed" ? { failedAt: updatedAt } : {}),
      ...(error === undefined ? {} : { error }),
      updatedAt,
    });
  },
});

export const markMediaStatus = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    status: automationRunStatusValidator,
    error: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (ctx, { secret, ownerId, id, status, error, updatedAt }) => {
    assertMediaWorkerSecret(secret);

    const run = await ctx.db
      .query("automationRuns")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!run) {
      throw new Error("Automation run not found.");
    }

    await ctx.db.patch(run._id, {
      status,
      ...(status === "running" && !run.startedAt ? { startedAt: updatedAt } : {}),
      ...(status === "completed" ? { completedAt: updatedAt } : {}),
      ...(status === "skipped" ? { skippedAt: updatedAt } : {}),
      ...(status === "failed" ? { failedAt: updatedAt } : {}),
      ...(error === undefined ? {} : { error }),
      updatedAt,
    });
  },
});
