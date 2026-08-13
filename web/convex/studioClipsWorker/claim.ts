import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getStudioBetaAccessStateForOwner } from "../studioBetaAccess/getStudioBetaAccessStateForOwner";
import { consumeStudioClipsWorkerClaimRateLimit } from "../studioClipsRateLimits/consumeStudioClipsWorkerClaimRateLimit";
import { consumeStudioClipsWorkerWriteRateLimits } from "../studioClipsRateLimits/consumeStudioClipsWorkerWriteRateLimits";
import { assertStudioClipsIdentifier } from "../studioClipsTasks/assertStudioClipsIdentifier";
import { getStudioClipsExecutionAvailability } from "../studioClipsTasks/getStudioClipsExecutionAvailability";
import { assertStudioClipsWorkerSecret } from "./assertStudioClipsWorkerSecret";
import { getStudioClipsProductIsOwnedActive } from "./getStudioClipsProductIsOwnedActive";
import { toStudioClipsWorkerClaim } from "./toStudioClipsWorkerClaim";
import { toStudioClipsWorkerRenderRevisionClaim } from "./toStudioClipsWorkerRenderRevisionClaim";

export const claim = mutation({
  args: {
    leaseSeconds: v.optional(v.number()),
    secret: v.string(),
    workerId: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioClipsWorkerSecret(args.secret);
    const workerId = assertStudioClipsIdentifier(args.workerId, "Worker ID");
    const leaseSeconds = Math.floor(args.leaseSeconds ?? 300);
    if (leaseSeconds < 30 || leaseSeconds > 900) {
      throw new Error("Studio Clips lease duration must be between 30 and 900 seconds.");
    }
    await consumeStudioClipsWorkerClaimRateLimit(ctx, workerId);
    const execution = getStudioClipsExecutionAvailability();
    if (execution.state === "unavailable") {
      return { availability: execution, claim: null };
    }
    const nowMs = Date.now();
    const [expiredTasks, expiredRevisions] = await Promise.all([
      ctx.db
        .query("studioClipsTasks")
        .withIndex("by_status_lease_expiry", (query) =>
          query
            .eq("status", "processing")
            .gte("leaseExpiresAt", "")
            .lte("leaseExpiresAt", new Date(nowMs).toISOString()),
        )
        .order("asc")
        .take(20),
      ctx.db
        .query("studioClipsRenderRevisions")
        .withIndex("by_status_lease_expiry", (query) =>
          query
            .eq("status", "processing")
            .gte("leaseExpiresAt", "")
            .lte("leaseExpiresAt", new Date(nowMs).toISOString()),
        )
        .order("asc")
        .take(20),
    ]);
    const expired = [...expiredTasks, ...expiredRevisions]
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .find(
      (task) =>
        (!("archivedAt" in task) || !task.archivedAt) &&
        task.leaseExpiresAt !== undefined &&
        Date.parse(task.leaseExpiresAt) <= nowMs,
    );
    const [queuedTasks, queuedRevisions] = expired
      ? [[], []]
      : await Promise.all([
          ctx.db
            .query("studioClipsTasks")
            .withIndex("by_status_created", (query) => query.eq("status", "queued"))
            .order("asc")
            .take(20),
          ctx.db
            .query("studioClipsRenderRevisions")
            .withIndex("by_status_created", (query) => query.eq("status", "queued"))
            .order("asc")
            .take(20),
        ]);
    const queued = [...queuedTasks, ...queuedRevisions]
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .find(
        (task) =>
          (!("archivedAt" in task) || !task.archivedAt) &&
          !task.cancelRequestedAt,
      );
    const task = expired ?? queued;
    if (!task) return { availability: execution, claim: null };
    await consumeStudioClipsWorkerWriteRateLimits(ctx, task.ownerId);
    const now = new Date(nowMs).toISOString();
    if (task.cancelRequestedAt) {
      await ctx.db.patch(task._id, {
        cancelledAt: now,
        leaseExpiresAt: undefined,
        leaseId: undefined,
        leaseWorkerId: undefined,
        revision: task.revision + 1,
        status: "cancelled",
        updatedAt: now,
      });
      return { availability: execution, claim: null };
    }
    const [access, productOwned] = await Promise.all([
      getStudioBetaAccessStateForOwner(ctx, task.ownerId),
      getStudioClipsProductIsOwnedActive(ctx, task.ownerId, task.productId),
    ]);
    if (!access.hasAccess || !productOwned || task.attempt >= 5) {
      const message =
        task.attempt >= 5
          ? "Studio Clips exhausted its retry attempts."
          : "Studio access or Product ownership changed before processing.";
      await ctx.db.patch(task._id, {
        errorAt: now,
        failure: {
          code: task.attempt >= 5 ? "MAX_ATTEMPTS_EXCEEDED" : "ACCESS_REVOKED",
          kind: "permanent",
          message,
        },
        leaseExpiresAt: undefined,
        leaseId: undefined,
        leaseWorkerId: undefined,
        revision: task.revision + 1,
        status: "error",
        updatedAt: now,
      });
      return { availability: execution, claim: null };
    }
    const attempt = task.attempt + 1;
    const leaseId = `lease_${task.id}_${attempt}_${nowMs}`;
    await ctx.db.patch(task._id, {
      attempt,
      execution,
      failure: undefined,
      leaseExpiresAt: new Date(nowMs + leaseSeconds * 1_000).toISOString(),
      leaseId,
      leaseWorkerId: workerId,
      revision: task.revision + 1,
      startedAt: task.startedAt ?? now,
      status: "processing",
      updatedAt: now,
    });
    const claimed = await ctx.db.get(task._id);
    if (!claimed) throw new Error("Studio Clips claim disappeared.");
    return {
      availability: execution,
      claim: "operationJson" in claimed
        ? toStudioClipsWorkerRenderRevisionClaim(claimed)
        : toStudioClipsWorkerClaim(claimed),
    };
  },
});
