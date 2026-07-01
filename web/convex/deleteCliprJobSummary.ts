import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function deleteCliprJobSummary(
  ctx: MutationCtx,
  job: Pick<Doc<"cliprJobs">, "id" | "ownerId">,
) {
  const existingSummary = await ctx.db
    .query("cliprJobSummaries")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", job.ownerId).eq("id", job.id),
    )
    .unique();

  if (existingSummary) {
    await ctx.db.delete(existingSummary._id);
  }
}
