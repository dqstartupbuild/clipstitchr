import type { MutationCtx } from "../_generated/server";

export async function assertStudioClipsMergeOutputs(
  ctx: MutationCtx,
  input: {
    outputIds: string[];
    ownerId: string;
    productId: string;
    taskId: string;
  },
) {
  const outputs = [];
  for (const outputId of input.outputIds) {
    const output = await ctx.db
      .query("studioClipsOutputs")
      .withIndex("by_owner_product_id", (query) =>
        query
          .eq("ownerId", input.ownerId)
          .eq("productId", input.productId)
          .eq("id", outputId),
      )
      .unique();
    if (!output || output.taskId !== input.taskId) {
      throw new Error("Every merged output must belong to this Studio Clips task.");
    }
    outputs.push(output);
  }
  return outputs;
}
