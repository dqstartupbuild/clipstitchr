import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { createSwipeCardFields } from "./createSwipeCardFields";

export async function upsertSwipeCard(ctx: MutationCtx, swipe: Doc<"swipes">) {
  const existingCard = await ctx.db
    .query("swipeCards")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", swipe.ownerId).eq("id", swipe.id),
    )
    .unique();
  const fields = createSwipeCardFields(swipe);

  if (existingCard) {
    await ctx.db.patch(existingCard._id, fields);
    return existingCard._id;
  }

  return await ctx.db.insert("swipeCards", fields);
}
