import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { upsertAutomationRunSummary } from "./upsertAutomationRunSummary";

export async function markAutomationRunSkipped(
  ctx: MutationCtx,
  runDocumentId: Id<"automationRuns">,
  reason: string,
  updatedAt: string,
) {
  await ctx.db.patch(runDocumentId, {
    status: "skipped",
    skippedAt: updatedAt,
    error: reason,
    updatedAt,
  });
  const updatedRun = await ctx.db.get(runDocumentId);

  if (updatedRun) {
    await upsertAutomationRunSummary(ctx, updatedRun);
  }
}
