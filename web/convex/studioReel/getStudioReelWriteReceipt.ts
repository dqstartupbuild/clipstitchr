import type { MutationCtx } from "../_generated/server";

export async function getStudioReelWriteReceipt(
  ctx: MutationCtx,
  ownerId: string,
  idempotencyKey: string,
) {
  return await ctx.db
    .query("studioReelWriteReceipts")
    .withIndex("by_owner_idempotency", (query) =>
      query.eq("ownerId", ownerId).eq("idempotencyKey", idempotencyKey),
    )
    .unique();
}
