import type { MutationCtx } from "../_generated/server";

export async function getStudioEditorProjectWriteReceipt(
  ctx: MutationCtx,
  ownerId: string,
  idempotencyKey: string,
) {
  return await ctx.db
    .query("studioEditorProjectWriteReceipts")
    .withIndex("by_owner_idempotency", (query) =>
      query.eq("ownerId", ownerId).eq("idempotencyKey", idempotencyKey),
    )
    .unique();
}
