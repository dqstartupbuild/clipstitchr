import { createNotification } from "./createNotification";
import { getCompletedRunAssetLabel } from "./getCompletedRunAssetLabel";
import { getCompletedRunToolLabel } from "./getCompletedRunToolLabel";
import { getProductNameFromAutomationTasks } from "./getProductNameFromAutomationTasks";
import type { MutationCtx } from "./_generated/server";

type CreateCompletedRunNotificationArgs = {
  automationDate: string;
  completedAt: string;
  ownerId: string;
  productId?: string;
  runId: string;
  sourceType: "automation-run" | "stitchr-batch";
  tool: string;
};

export async function createCompletedRunNotification(
  ctx: MutationCtx,
  {
    automationDate,
    completedAt,
    ownerId,
    productId,
    runId,
    sourceType,
    tool,
  }: CreateCompletedRunNotificationArgs,
) {
  const tasks = await ctx.db
    .query("automationTasks")
    .withIndex("by_run", (q) => q.eq("runId", runId))
    .collect();
  const outputAssetIds = new Set(
    tasks.flatMap((task) => task.outputAssetIds ?? []),
  );
  const completedTaskCount = tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const count = Math.max(outputAssetIds.size, completedTaskCount);
  const safeCount = count > 0 ? count : 1;
  const toolLabel =
    sourceType === "stitchr-batch"
      ? "Stitchr Batch"
      : getCompletedRunToolLabel(tool);
  const assetLabel = getCompletedRunAssetLabel(tool, safeCount);
  const productName = getProductNameFromAutomationTasks(tasks);
  const productText = productName ? ` for ${productName}` : "";

  return await createNotification(ctx, {
    ownerId,
    productId,
    sourceType,
    sourceId: runId,
    dedupeKey: `${sourceType}:${runId}:completed`,
    title: `${toolLabel} is done`,
    preview: `${safeCount} ${assetLabel} created${productText}.`,
    message: `${toolLabel} finished for ${automationDate}. It created ${safeCount} ${assetLabel}${productText}.`,
    createdAt: completedAt,
  });
}
