import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";

export type WorkerLaunchTarget = "media" | "provider";

const immediateCoalesceMs = 15_000;

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
  if (delayMs > 0) {
    await ctx.scheduler.runAfter(delayMs, internal.workerDispatch.runWorker, {
      worker,
    });
    return;
  }

  const existing = await ctx.db
    .query("workerLaunchState")
    .withIndex("by_worker", (q) => q.eq("worker", worker))
    .unique();
  const lastRequestedMs = existing?.lastRequestedAt
    ? Date.parse(existing.lastRequestedAt)
    : 0;
  const nowMs = Date.parse(now);
  const shouldCoalesce =
    existing &&
    Number.isFinite(lastRequestedMs) &&
    Number.isFinite(nowMs) &&
    nowMs - lastRequestedMs < immediateCoalesceMs;

  if (shouldCoalesce) {
    return;
  }

  if (existing) {
    await ctx.db.patch(existing._id, {
      lastRequestedAt: now,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("workerLaunchState", {
      worker,
      lastRequestedAt: now,
      updatedAt: now,
    });
  }

  await ctx.scheduler.runAfter(delayMs, internal.workerDispatch.runWorker, {
    worker,
  });
}
