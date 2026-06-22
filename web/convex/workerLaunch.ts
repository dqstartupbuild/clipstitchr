import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";

export type WorkerLaunchTarget = "media" | "provider";

const immediateCoalesceMs = 15_000;
const recoveryDelayMs = 10 * 60 * 1000;
const recoveryCoalesceMs = recoveryDelayMs;
const epochLaunchTimestamp = "1970-01-01T00:00:00.000Z";

export async function requestWorkerLaunch({
  ctx,
  delayMs = 0,
  now,
  worker,
}: {
  ctx: MutationCtx;
  delayMs?: number;
  now: string;
  worker: WorkerLaunchTarget;
}) {
  const existing = await ctx.db
    .query("workerLaunchState")
    .withIndex("by_worker", (q) => q.eq("worker", worker))
    .unique();
  const lastRequestedMs = existing?.lastRequestedAt
    ? Date.parse(existing.lastRequestedAt)
    : 0;
  const nowMs = Date.parse(now);
  const shouldCoalesceImmediate =
    delayMs === 0 &&
    existing &&
    Number.isFinite(lastRequestedMs) &&
    Number.isFinite(nowMs) &&
    nowMs - lastRequestedMs < immediateCoalesceMs;
  const shouldSchedulePrimary = delayMs > 0 || !shouldCoalesceImmediate;
  const lastRecoveryRequestedMs = existing?.lastRecoveryRequestedAt
    ? Date.parse(existing.lastRecoveryRequestedAt)
    : 0;
  const shouldScheduleRecovery =
    !existing?.lastRecoveryRequestedAt ||
    !Number.isFinite(lastRecoveryRequestedMs) ||
    !Number.isFinite(nowMs) ||
    nowMs - lastRecoveryRequestedMs >= recoveryCoalesceMs;

  const statePatch: {
    lastRecoveryRequestedAt?: string;
    lastRequestedAt?: string;
    updatedAt: string;
  } = { updatedAt: now };

  if (delayMs === 0 && shouldSchedulePrimary) {
    statePatch.lastRequestedAt = now;
  }

  if (shouldScheduleRecovery) {
    statePatch.lastRecoveryRequestedAt = now;
  }

  if (existing) {
    if (statePatch.lastRequestedAt || statePatch.lastRecoveryRequestedAt) {
      await ctx.db.patch(existing._id, statePatch);
    }
  } else if (statePatch.lastRequestedAt || statePatch.lastRecoveryRequestedAt) {
    await ctx.db.insert("workerLaunchState", {
      worker,
      lastRequestedAt: statePatch.lastRequestedAt ?? epochLaunchTimestamp,
      ...(statePatch.lastRecoveryRequestedAt
        ? { lastRecoveryRequestedAt: statePatch.lastRecoveryRequestedAt }
        : {}),
      updatedAt: now,
    });
  }

  if (shouldSchedulePrimary) {
    await ctx.scheduler.runAfter(delayMs, internal.workerDispatch.runWorker, {
      worker,
    });
  }

  if (shouldScheduleRecovery) {
    await ctx.scheduler.runAfter(
      delayMs + recoveryDelayMs,
      internal.workerDispatch.runWorker,
      { worker },
    );
  }
}
