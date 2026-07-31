import type { MutationCtx } from "../_generated/server";
import { listSocialQueueSlotCandidates } from "../../lib/clipstitchr/social/listSocialQueueSlotCandidates";
import type { SocialWeeklySlot } from "../../lib/clipstitchr/social/types/SocialWeeklySlot";

export async function findAvailableSocialQueueSlot(
  ctx: MutationCtx,
  args: {
    after: string;
    horizonDays: number;
    productId: string;
    reservedSlots?: Set<string>;
    slots: SocialWeeklySlot[];
    timezone: string;
  },
) {
  const candidates = listSocialQueueSlotCandidates({
    after: args.after,
    horizonDays: args.horizonDays,
    slots: args.slots,
    timezone: args.timezone,
  });

  for (const scheduledFor of candidates) {
    const queueSlotKey = `${args.productId}:${scheduledFor}`;

    if (args.reservedSlots?.has(queueSlotKey)) {
      continue;
    }

    const existing = await ctx.db
      .query("socialPosts")
      .withIndex("by_product_queue_slot", (index) =>
        index
          .eq("productId", args.productId)
          .eq("queueSlotKey", queueSlotKey),
      )
      .first();

    if (!existing || existing.status === "canceled") {
      return { queueSlotKey, scheduledFor };
    }
  }

  throw new Error(
    "No open posting time was found inside this product's queue window.",
  );
}
