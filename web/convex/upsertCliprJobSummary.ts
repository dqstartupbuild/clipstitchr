import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { createCliprJobSummaryFields } from "./createCliprJobSummaryFields";

export async function upsertCliprJobSummary(
  ctx: MutationCtx,
  job: Doc<"cliprJobs">,
) {
  const existingSummary = await ctx.db
    .query("cliprJobSummaries")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", job.ownerId).eq("id", job.id),
    )
    .unique();
  const fields = createCliprJobSummaryFields(job);

  if (existingSummary) {
    await ctx.db.patch(existingSummary._id, fields);
    return existingSummary._id;
  }

  return await ctx.db.insert("cliprJobSummaries", fields);
}
