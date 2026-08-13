import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function createStudioClipsWriteReceipt(
  ctx: MutationCtx,
  input: Omit<Doc<"studioClipsWriteReceipts">, "_creationTime" | "_id">,
) {
  await ctx.db.insert("studioClipsWriteReceipts", input);
}
