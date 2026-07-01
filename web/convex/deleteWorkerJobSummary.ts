import type { MutationCtx } from "./_generated/server";

export async function deleteWorkerJobSummary(
  ctx: MutationCtx,
  worker: "media" | "provider",
  id: string,
) {
  const existingSummary = await ctx.db
    .query("workerJobSummaries")
    .withIndex("by_worker_job_id", (q) => q.eq("worker", worker).eq("id", id))
    .unique();

  if (existingSummary) {
    await ctx.db.delete(existingSummary._id);
  }
}
