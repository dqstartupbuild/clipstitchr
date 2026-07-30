import type { MutationCtx } from "../_generated/server";
import { getSocialSchedulingHorizonDays } from "../../lib/clipstitchr/social/getSocialSchedulingHorizonDays";

export async function createInitialProductSocialQueue(
  ctx: MutationCtx,
  ownerId: string,
  productId: string,
  now: string,
) {
  const existing = await ctx.db
    .query("productSocialQueues")
    .withIndex("by_owner_product", (index) =>
      index.eq("ownerId", ownerId).eq("productId", productId),
    )
    .unique();

  if (existing) {
    return existing._id;
  }

  return await ctx.db.insert("productSocialQueues", {
    ownerId,
    productId,
    timezone: "UTC",
    weeklySlots: [],
    paused: true,
    schedulingHorizonDays: getSocialSchedulingHorizonDays(),
    revision: 1,
    createdAt: now,
    updatedAt: now,
  });
}
