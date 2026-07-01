import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { createWorkerJobSummaryFields } from "./createWorkerJobSummaryFields";

export async function upsertWorkerJobSummary(
  ctx: MutationCtx,
  worker: "media" | "provider",
  job: Doc<"mediaJobs"> | Doc<"providerJobs">,
) {
  const existingSummary = await ctx.db
    .query("workerJobSummaries")
    .withIndex("by_worker_job_id", (q) =>
      q.eq("worker", worker).eq("id", job.id),
    )
    .unique();
  const fields = createWorkerJobSummaryFields(worker, job);

  if (existingSummary) {
    await ctx.db.patch(existingSummary._id, fields);
    return existingSummary._id;
  }

  return await ctx.db.insert("workerJobSummaries", fields);
}
