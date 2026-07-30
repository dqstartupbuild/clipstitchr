import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { findAvailableSocialQueueSlot } from "./findAvailableSocialQueueSlot";

export async function reflowFutureProductQueuePosts(
  ctx: MutationCtx,
  args: {
    now: string;
    ownerId: string;
    productId: string;
    queue: Doc<"productSocialQueues">;
  },
) {
  const futurePosts = (
    await ctx.db
      .query("socialPosts")
      .withIndex("by_owner_product_scheduled", (index) =>
        index.eq("ownerId", args.ownerId).eq("productId", args.productId),
      )
      .collect()
  )
    .filter(
      (post) =>
        post.scheduleMode === "product_queue" &&
        post.status === "scheduled" &&
        Date.parse(post.scheduledFor) > Date.parse(args.now),
    )
    .sort(
      (left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt),
    );
  const eligiblePosts = (
    await Promise.all(
      futurePosts.map(async (post) => {
        const targets = await ctx.db
          .query("socialPostTargets")
          .withIndex("by_owner_post", (index) =>
            index.eq("ownerId", args.ownerId).eq("postId", post.id),
          )
          .collect();

        return { post, targets };
      }),
    )
  ).filter(
    ({ targets }) =>
      targets.length > 0 &&
      targets.every((target) => target.status === "scheduled"),
  );
  const reservedSlots = new Set<string>();
  let after = args.now;

  for (const { post } of eligiblePosts) {
    await ctx.db.patch(post._id, {
      queueSlotKey: undefined,
      updatedAt: args.now,
    });
  }

  for (const { post, targets } of eligiblePosts) {
    const slot = await findAvailableSocialQueueSlot(ctx, {
      after,
      horizonDays: args.queue.schedulingHorizonDays,
      productId: args.productId,
      reservedSlots,
      slots: args.queue.weeklySlots,
      timezone: args.queue.timezone,
    });

    await ctx.db.patch(post._id, {
      queueRevision: args.queue.revision,
      queueSlotKey: slot.queueSlotKey,
      scheduledFor: slot.scheduledFor,
      updatedAt: args.now,
    });

    for (const target of targets) {
      await ctx.db.patch(target._id, {
        scheduledFor: slot.scheduledFor,
        nextAttemptAt: slot.scheduledFor,
        updatedAt: args.now,
      });
    }

    reservedSlots.add(slot.queueSlotKey);
    after = slot.scheduledFor;
  }

  return eligiblePosts.length;
}
