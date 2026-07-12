import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";
import { upsertWorkerJobSummary } from "../upsertWorkerJobSummary";
import { requestWorkerLaunch } from "../workerLaunch";

export const dispatchProviderJob = mutation({
  args: {
    createdAt: v.string(),
    id: v.string(),
    idempotencyKey: v.string(),
    providerJobId: v.string(),
    secret: v.string(),
  },
  handler: async (
    ctx,
    { createdAt, id, idempotencyKey, providerJobId, secret },
  ) => {
    assertRateLimitApiSecret(secret);
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const variant = await ctx.db
      .query("hookLabIdeaVariants")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!variant) {
      throw new Error("Idea version not found.");
    }

    const normalizedProviderJobId = providerJobId.trim();
    const normalizedIdempotencyKey = idempotencyKey.trim();
    const existing = await ctx.db
      .query("providerJobs")
      .withIndex("by_idempotency_key", (query) =>
        query.eq("idempotencyKey", normalizedIdempotencyKey),
      )
      .unique();

    if (existing) {
      if (
        existing.ownerId !== ownerId ||
        existing.jobType !== "hook-lab-idea-use" ||
        existing.id !== normalizedProviderJobId
      ) {
        throw new Error("Idea version job does not match this request.");
      }

      if (
        variant.providerJobId &&
        variant.providerJobId !== normalizedProviderJobId
      ) {
        throw new Error("Idea version already has a different job.");
      }

      if (variant.status === "queued") {
        await ctx.db.patch(variant._id, {
          providerJobId: normalizedProviderJobId,
          status: "writing",
          updatedAt: createdAt,
        });
      }

      await upsertWorkerJobSummary(ctx, "provider", existing);

      return { id: existing.id, status: existing.status };
    }

    if (variant.status !== "queued" || variant.providerJobId) {
      throw new Error("This idea version has already started.");
    }

    const providerJobDocumentId = await ctx.db.insert("providerJobs", {
      ownerId,
      id: normalizedProviderJobId,
      jobType: "hook-lab-idea-use",
      status: "queued",
      stage: "awaiting-provider",
      idempotencyKey: normalizedIdempotencyKey,
      inputSnapshotJson: JSON.stringify({ variantId: variant.id }),
      outputAssetIds: [],
      providerJobIds: [],
      mediaJobIds: [],
      progress: 0,
      attempt: 0,
      createdAt,
      updatedAt: createdAt,
    });
    const providerJob = await ctx.db.get(providerJobDocumentId);

    if (!providerJob) {
      throw new Error("Unable to create the Idea version job.");
    }

    await ctx.db.patch(variant._id, {
      providerJobId: providerJob.id,
      status: "writing",
      updatedAt: createdAt,
    });
    await upsertWorkerJobSummary(ctx, "provider", providerJob);
    await requestWorkerLaunch({ ctx, now: createdAt, worker: "provider" });

    return { id: providerJob.id, status: providerJob.status };
  },
});
