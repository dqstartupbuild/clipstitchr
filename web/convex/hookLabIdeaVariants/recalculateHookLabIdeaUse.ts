import type { MutationCtx } from "../_generated/server";

export async function recalculateHookLabIdeaUse({
  ctx,
  ownerId,
  updatedAt,
  useId,
}: {
  ctx: MutationCtx;
  ownerId: string;
  updatedAt: string;
  useId: string;
}) {
  const use = await ctx.db
    .query("hookLabIdeaUses")
    .withIndex("by_owner_id", (index) =>
      index.eq("ownerId", ownerId).eq("id", useId),
    )
    .unique();

  if (!use) {
    return;
  }

  const variants = await ctx.db
    .query("hookLabIdeaVariants")
    .withIndex("by_owner_use_variant", (index) =>
      index.eq("ownerId", ownerId).eq("useId", use.id),
    )
    .take(5);
  const completedVariantCount = variants.filter(
    (variant) => variant.status === "completed",
  ).length;
  const failedVariantCount = variants.filter(
    (variant) => variant.status === "failed",
  ).length;
  const terminalVariantCount = completedVariantCount + failedVariantCount;
  const allTerminal = terminalVariantCount >= use.variationCount;
  const status = allTerminal
    ? completedVariantCount === use.variationCount
      ? ("completed" as const)
      : completedVariantCount > 0
        ? ("partial" as const)
        : ("failed" as const)
    : terminalVariantCount > 0
      ? ("generating" as const)
      : use.status === "queued"
        ? ("queued" as const)
        : ("generating" as const);
  const shouldCountUse = completedVariantCount > 0 && !use.countedAt;

  await ctx.db.patch(use._id, {
    completedVariantCount,
    failedVariantCount,
    progress: Math.min(1, terminalVariantCount / use.variationCount),
    status,
    ...(allTerminal ? { completedAt: updatedAt } : {}),
    ...(shouldCountUse ? { countedAt: updatedAt } : {}),
    updatedAt,
  });

  if (shouldCountUse) {
    const idea = await ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", use.ideaId),
      )
      .unique();

    if (idea) {
      await ctx.db.patch(idea._id, {
        lastUsedAt: updatedAt,
        updatedAt,
        useCount: idea.useCount + 1,
      });
    }
  }
}
