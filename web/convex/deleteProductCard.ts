import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function deleteProductCard(
  ctx: MutationCtx,
  product: Pick<Doc<"products">, "id" | "ownerId">,
) {
  const existingCard = await ctx.db
    .query("productCards")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", product.ownerId).eq("id", product.id),
    )
    .unique();

  if (existingCard) {
    await ctx.db.delete(existingCard._id);
  }
}
