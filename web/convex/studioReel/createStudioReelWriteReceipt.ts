import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

export async function createStudioReelWriteReceipt(
  ctx: MutationCtx,
  fields: Omit<Doc<"studioReelWriteReceipts">, "_id" | "_creationTime">,
) {
  await ctx.db.insert("studioReelWriteReceipts", fields);
}
