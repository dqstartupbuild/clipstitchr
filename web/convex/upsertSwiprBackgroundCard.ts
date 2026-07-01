import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import {
  createSwiprBackgroundCardFields,
  type SwiprBackgroundCardFieldSource,
} from "./createSwiprBackgroundCardFields";

export async function upsertSwiprBackgroundCard(
  ctx: MutationCtx,
  background: Doc<"swiprBackgrounds"> | SwiprBackgroundCardFieldSource,
) {
  const existingCard = await ctx.db
    .query("swiprBackgroundCards")
    .withIndex("by_background_id", (q) => q.eq("id", background.id))
    .unique();
  const fields = createSwiprBackgroundCardFields(background);

  if (existingCard) {
    await ctx.db.patch(existingCard._id, fields);
    return existingCard._id;
  }

  return await ctx.db.insert("swiprBackgroundCards", fields);
}
