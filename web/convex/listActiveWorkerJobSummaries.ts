import type { QueryCtx } from "./_generated/server";

export async function listActiveWorkerJobSummaries(
  ctx: QueryCtx,
  ownerId: string,
  worker: "media" | "provider",
  limit = 25,
) {
  const [queuedJobs, runningJobs] = await Promise.all([
    ctx.db
      .query("workerJobSummaries")
      .withIndex("by_owner_worker_status_created", (q) =>
        q.eq("ownerId", ownerId).eq("worker", worker).eq("status", "queued"),
      )
      .order("desc")
      .take(limit),
    ctx.db
      .query("workerJobSummaries")
      .withIndex("by_owner_worker_status_created", (q) =>
        q.eq("ownerId", ownerId).eq("worker", worker).eq("status", "running"),
      )
      .order("desc")
      .take(limit),
  ]);

  return [...queuedJobs, ...runningJobs].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
}
