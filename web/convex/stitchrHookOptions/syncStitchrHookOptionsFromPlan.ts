import type { MutationCtx } from "../_generated/server";

type StitchrHookPlanSource = "batch_planner" | "manual" | "worker_fallback";

type StitchrHookVariantInput = {
  acceptedAt?: string;
  angle: string;
  feedbackStatus?: "accepted" | "rejected";
  reason: string;
  rejectedAt?: string;
  rejectionReason?: string;
  text: string;
};

export async function syncStitchrHookOptionsFromPlan({
  createdAt,
  ctx,
  hookOptions,
  ownerId,
  planCreatedAt,
  planId,
  planSource,
  productId,
  productName,
  selectedHook,
  stitchId,
  updatedAt,
}: {
  createdAt: string;
  ctx: MutationCtx;
  hookOptions: StitchrHookVariantInput[];
  ownerId: string;
  planCreatedAt: string;
  planId: string;
  planSource: StitchrHookPlanSource;
  productId?: string;
  productName?: string;
  selectedHook: string;
  stitchId?: string;
  updatedAt: string;
}) {
  const existingOptions = await ctx.db
    .query("stitchrHookOptions")
    .withIndex("by_owner_plan_rank", (index) =>
      index.eq("ownerId", ownerId).eq("planId", planId),
    )
    .take(12);
  const selectedKey = selectedHook.trim().replace(/\s+/g, " ").toLowerCase();

  for (const [rank, option] of hookOptions.entries()) {
    const hook = option.text.trim().replace(/\s+/g, " ").slice(0, 240);

    if (!hook) {
      continue;
    }

    const existing = existingOptions.find((entry) => entry.rank === rank);
    const hookChanged = Boolean(
      existing &&
        existing.hook.trim().replace(/\s+/g, " ").toLowerCase() !==
          hook.toLowerCase(),
    );
    const reviewState = hookChanged
      ? ("needs_review" as const)
      : option.feedbackStatus === "accepted"
        ? ("saved" as const)
        : option.feedbackStatus === "rejected"
          ? ("not_for_me" as const)
          : ("needs_review" as const);
    const fields = {
      ownerId,
      id: `${planId}:option:${rank}`,
      planId,
      productId,
      productName,
      stitchId,
      rank,
      hook,
      normalizedHook: hook.toLowerCase(),
      angle: option.angle.trim().slice(0, 90),
      reason: option.reason.trim().slice(0, 280),
      isSelected: hook.toLowerCase() === selectedKey,
      reviewState,
      reviewedAt: hookChanged
        ? undefined
        : option.acceptedAt ?? option.rejectedAt,
      rejectionReason: hookChanged ? undefined : option.rejectionReason,
      ...(hookChanged ? { linkedIdeaId: undefined } : {}),
      planSource,
      planCreatedAt,
      createdAt: existing?.createdAt ?? createdAt,
      updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, fields);
    } else {
      await ctx.db.insert("stitchrHookOptions", fields);
    }
  }

  for (const existing of existingOptions) {
    if (existing.rank >= hookOptions.length) {
      await ctx.db.delete(existing._id);
    }
  }
}
