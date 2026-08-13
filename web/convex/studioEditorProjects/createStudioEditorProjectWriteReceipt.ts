import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function createStudioEditorProjectWriteReceipt(
  ctx: MutationCtx,
  input: Omit<Doc<"studioEditorProjectWriteReceipts">, "_id" | "_creationTime">,
) {
  await ctx.db.insert("studioEditorProjectWriteReceipts", input);
}
