import type { MutationCtx } from "./_generated/server";

export async function recordStitchrBatchPairHistory(
  ctx: MutationCtx,
  {
    batchDate,
    completedAt,
    demoClipId,
    ownerId,
    stitchId,
    ugcClipId,
  }: {
    batchDate: string;
    completedAt: string;
    demoClipId: string;
    ownerId: string;
    stitchId: string;
    ugcClipId: string;
  },
) {
  const history = await ctx.db
    .query("stitchrBatchPairHistory")
    .withIndex("by_owner_pair", (q) =>
      q.eq("ownerId", ownerId).eq("ugcClipId", ugcClipId).eq("demoClipId", demoClipId),
    )
    .unique();

  if (history) {
    await ctx.db.patch(history._id, {
      lastUsedAt: completedAt,
      useCount: history.useCount + 1,
      recentUseWindowKey: batchDate,
      lastOutputStitchId: stitchId,
      updatedAt: completedAt,
    });
    return;
  }

  await ctx.db.insert("stitchrBatchPairHistory", {
    ownerId,
    ugcClipId,
    demoClipId,
    lastUsedAt: completedAt,
    useCount: 1,
    recentUseWindowKey: batchDate,
    lastOutputStitchId: stitchId,
    createdAt: completedAt,
    updatedAt: completedAt,
  });
}
