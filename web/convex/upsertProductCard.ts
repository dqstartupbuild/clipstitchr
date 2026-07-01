import type { MutationCtx } from "./_generated/server";
import {
  createProductCardFields,
  type ProductCardFieldSource,
} from "./createProductCardFields";

export async function upsertProductCard(
  ctx: MutationCtx,
  product: ProductCardFieldSource,
) {
  const existingCard = await ctx.db
    .query("productCards")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", product.ownerId).eq("id", product.id),
    )
    .unique();
  const fields = createProductCardFields(product);

  if (existingCard) {
    await ctx.db.patch(existingCard._id, fields);
    return existingCard._id;
  }

  return await ctx.db.insert("productCards", fields);
}
