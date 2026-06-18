import { createCompletedRunNotification } from "./createCompletedRunNotification";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

type MarkAutomationRunStatusArgs = {
  error?: string;
  runDocumentId: Id<"automationRuns">;
  status:
    | "canceled"
    | "completed"
    | "failed"
    | "queued"
    | "running"
    | "skipped";
  updatedAt: string;
};

export async function markAutomationRunStatus(
  ctx: MutationCtx,
  { error, runDocumentId, status, updatedAt }: MarkAutomationRunStatusArgs,
) {
  const run = await ctx.db.get(runDocumentId);

  if (!run) {
    throw new Error("Automation run not found.");
  }

  await ctx.db.patch(runDocumentId, {
    status,
    ...(status === "running" && !run.startedAt ? { startedAt: updatedAt } : {}),
    ...(status === "completed" ? { completedAt: updatedAt } : {}),
    ...(status === "skipped" ? { skippedAt: updatedAt } : {}),
    ...(status === "failed" ? { failedAt: updatedAt } : {}),
    ...(error === undefined ? {} : { error }),
    updatedAt,
  });

  if (status === "completed" && run.status !== "completed") {
    await createCompletedRunNotification(ctx, {
      automationDate: run.automationDate,
      completedAt: updatedAt,
      ownerId: run.ownerId,
      productId: run.productId,
      runId: run.id,
      sourceType: "automation-run",
      tool: run.tool,
    });
  }
}
